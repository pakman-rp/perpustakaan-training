import React, { useState } from 'react';
import { History, Book, Calendar, Clock, CheckCircle, AlertTriangle, Search } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';

const UserBorrowHistory: React.FC = () => {
  const { borrowRecords, books } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'returned' | 'overdue'>('all');

  const userBorrows = borrowRecords.filter(record => record.userId === user?.id);

  const enrichedRecords = userBorrows.map(record => {
    const book = books.find(b => b.id === record.bookId);
    const isOverdue = record.status === 'active' && new Date() > record.dueDate;
    
    return {
      ...record,
      book,
      isOverdue,
      actualStatus: isOverdue ? 'overdue' : record.status
    };
  });

  const filteredRecords = enrichedRecords.filter(record => {
    const matchesSearch = record.book?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.book?.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === 'all' || record.actualStatus === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const sortedRecords = filteredRecords.sort((a, b) => 
    new Date(b.borrowedAt).getTime() - new Date(a.borrowedAt).getTime()
  );

  const stats = {
    total: userBorrows.length,
    active: userBorrows.filter(r => r.status === 'active').length,
    returned: userBorrows.filter(r => r.status === 'returned').length,
    overdue: enrichedRecords.filter(r => r.isOverdue).length
  };

  const getStatusIcon = (status: string, isOverdue: boolean) => {
    if (isOverdue) {
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }
    
    switch (status) {
      case 'active':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'returned':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <History className="h-5 w-5 text-gray-500" />;
    }
  };

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">My Borrowing History</h2>
        <div className="text-sm text-gray-500">
          Total: {userBorrows.length} books borrowed
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
              <p className="text-sm font-medium text-gray-600">Total Borrowed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Currently Borrowed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
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
              <AlertTriangle className="h-6 w-6 text-red-600" />
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
              placeholder="Search by book title or author..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">All Status</option>
              <option value="active">Currently Borrowed</option>
              <option value="returned">Returned</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Borrowing Records</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {sortedRecords.length > 0 ? (
            sortedRecords.map((record) => {
              const daysUntilDue = record.status === 'active' ? 
                Math.ceil((record.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;
              
              return (
                <div key={record.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {getStatusIcon(record.status, record.isOverdue)}
                      </div>
                      <div className="flex-shrink-0 h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Book className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-lg font-medium text-gray-900 truncate">
                          {record.book?.title || 'Unknown Book'}
                        </p>
                        <p className="text-sm text-gray-600">
                          by {record.book?.author || 'Unknown Author'}
                        </p>
                        <div className="flex items-center mt-1 space-x-4 text-xs text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            Borrowed: {new Date(record.borrowedAt).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            Due: {new Date(record.dueDate).toLocaleDateString()}
                          </div>
                          {record.returnedAt && (
                            <div className="flex items-center">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Returned: {new Date(record.returnedAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        getStatusBadge(record.status, record.isOverdue)
                      }`}>
                        {record.isOverdue ? 'Overdue' : record.status}
                      </span>
                      
                      {record.status === 'active' && (
                        <div className={`text-xs ${
                          record.isOverdue ? 'text-red-600 font-medium' : 
                          daysUntilDue <= 3 ? 'text-yellow-600 font-medium' : 
                          'text-gray-500'
                        }`}>
                          {record.isOverdue ? 
                            `${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) > 1 ? 's' : ''} overdue` :
                            daysUntilDue <= 3 ?
                            `${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''} left` :
                            `${daysUntilDue} days remaining`
                          }
                        </div>
                      )}
                      
                      {record.fineAmount > 0 && (
                        <div className="text-xs text-red-600 font-medium">
                          Fine: Rp {record.fineAmount.toLocaleString()}
                          {record.finePaid && <span className="text-green-600 ml-1">(Paid)</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <History className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No records found matching your criteria' 
                  : 'No borrowing history yet'
                }
              </p>
              {(searchTerm || statusFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserBorrowHistory;