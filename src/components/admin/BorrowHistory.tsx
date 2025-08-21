import React, { useState } from 'react';
import { History, Book, User, Calendar, DollarSign, Filter, Search } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

const BorrowHistory: React.FC = () => {
  const { borrowRecords, books, members, fines } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'returned' | 'overdue'>('all');

  const enrichedRecords = borrowRecords.map(record => {
    const book = books.find(b => b.id === record.bookId);
    const member = members.find(m => m.id === record.userId);
    const fine = fines.find(f => f.borrowRecordId === record.id);
    const isOverdue = record.status === 'active' && new Date() > record.dueDate;
    
    return {
      ...record,
      book,
      member,
      fine,
      isOverdue,
      actualStatus: isOverdue ? 'overdue' : record.status
    };
  });

  const filteredRecords = enrichedRecords.filter(record => {
    const matchesSearch = 
      record.book?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.member?.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.book?.author.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = statusFilter === 'all' || record.actualStatus === statusFilter;
    
    return matchesSearch && matchesFilter;
  });

  const sortedRecords = filteredRecords.sort((a, b) => 
    new Date(b.borrowedAt).getTime() - new Date(a.borrowedAt).getTime()
  );

  const getStatusBadge = (status: string, isOverdue: boolean) => {
    if (isOverdue) {
      return 'bg-red-100 text-red-800';
    }
    
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'returned':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    total: borrowRecords.length,
    active: borrowRecords.filter(r => r.status === 'active').length,
    returned: borrowRecords.filter(r => r.status === 'returned').length,
    overdue: enrichedRecords.filter(r => r.isOverdue).length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Borrowing History</h2>
        <div className="text-sm text-gray-500">
          Total Records: {borrowRecords.length}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-gray-100">
              <History className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Borrows</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <Book className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Borrows</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Returned</p>
              <p className="text-2xl font-bold text-gray-900">{stats.returned}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100">
              <DollarSign className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by book title, author, or member name..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="returned">Returned</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Book & Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Borrow Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Return Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fine
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Book className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {record.book?.title || 'Unknown Book'}
                        </div>
                        <div className="text-sm text-gray-500">
                          by {record.book?.author || 'Unknown Author'}
                        </div>
                        <div className="text-xs text-gray-400 flex items-center mt-1">
                          <User className="h-3 w-3 mr-1" />
                          {record.member?.username || 'Unknown Member'}
                          {record.member?.membershipId && ` (${record.member.membershipId})`}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(record.borrowedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className={record.isOverdue ? 'text-red-600 font-medium' : ''}>
                      {new Date(record.dueDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.returnedAt ? new Date(record.returnedAt).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getStatusBadge(record.status, record.isOverdue)
                    }`}>
                      {record.isOverdue ? 'Overdue' : record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.fineAmount > 0 ? (
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-red-500 mr-1" />
                        <span className="text-red-600 font-medium">
                          Rp {record.fineAmount.toLocaleString()}
                        </span>
                        {record.finePaid && (
                          <span className="ml-2 text-xs text-green-600">(Paid)</span>
                        )}
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sortedRecords.length === 0 && (
          <div className="text-center py-8">
            <History className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">No borrowing records found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BorrowHistory;