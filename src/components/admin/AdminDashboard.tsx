import React from 'react';
import { Book, Users, History, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

const AdminDashboard: React.FC = () => {
  const { books, borrowRecords, members, fines } = useData();

  const stats = {
    totalBooks: books.length,
    availableBooks: books.filter(b => b.status === 'available').length,
    borrowedBooks: books.filter(b => b.status === 'borrowed').length,
    totalMembers: members.length,
    activeBorrows: borrowRecords.filter(r => r.status === 'active').length,
    overdueBooks: borrowRecords.filter(r => {
      if (r.status !== 'active') return false;
      return new Date() > r.dueDate;
    }).length,
    totalFines: fines.reduce((sum, fine) => sum + fine.amount, 0),
    unpaidFines: fines.filter(f => !f.paid).length
  };

  const recentBorrows = borrowRecords
    .sort((a, b) => new Date(b.borrowedAt).getTime() - new Date(a.borrowedAt).getTime())
    .slice(0, 5);

  const StatCard: React.FC<{
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
  }> = ({ title, value, icon, color, subtitle }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="p-3 rounded-full" style={{ backgroundColor: `${color}20` }}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Dashboard Overview</h2>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Books"
          value={stats.totalBooks}
          icon={<Book className="h-6 w-6 text-blue-600" />}
          color="#3B82F6"
          subtitle={`${stats.availableBooks} available`}
        />
        
        <StatCard
          title="Active Members"
          value={stats.totalMembers}
          icon={<Users className="h-6 w-6 text-green-600" />}
          color="#10B981"
        />
        
        <StatCard
          title="Active Borrows"
          value={stats.activeBorrows}
          icon={<History className="h-6 w-6 text-purple-600" />}
          color="#8B5CF6"
        />
        
        <StatCard
          title="Overdue Books"
          value={stats.overdueBooks}
          icon={<AlertTriangle className="h-6 w-6 text-red-600" />}
          color="#EF4444"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Fines"
          value={`Rp ${stats.totalFines.toLocaleString()}`}
          icon={<TrendingUp className="h-6 w-6 text-yellow-600" />}
          color="#F59E0B"
          subtitle={`${stats.unpaidFines} unpaid`}
        />
        
        <StatCard
          title="Books Borrowed"
          value={stats.borrowedBooks}
          icon={<Clock className="h-6 w-6 text-indigo-600" />}
          color="#6366F1"
          subtitle={`${((stats.borrowedBooks / stats.totalBooks) * 100).toFixed(1)}% utilization`}
        />
        
        <StatCard
          title="Available Books"
          value={stats.availableBooks}
          icon={<Book className="h-6 w-6 text-emerald-600" />}
          color="#059669"
          subtitle="Ready to borrow"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Borrowing Activity</h3>
        </div>
        <div className="p-6">
          {recentBorrows.length > 0 ? (
            <div className="space-y-4">
              {recentBorrows.map((record) => {
                const book = books.find(b => b.id === record.bookId);
                const member = members.find(m => m.id === record.userId);
                const isOverdue = new Date() > record.dueDate && record.status === 'active';
                
                return (
                  <div key={record.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${isOverdue ? 'bg-red-100' : 'bg-blue-100'}`}>
                        <Book className={`h-5 w-5 ${isOverdue ? 'text-red-600' : 'text-blue-600'}`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{book?.title || 'Unknown Book'}</p>
                        <p className="text-sm text-gray-600">
                          Borrowed by {member?.username || 'Unknown User'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(record.borrowedAt).toLocaleDateString()}
                      </p>
                      <p className={`text-xs ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                        Due: {new Date(record.dueDate).toLocaleDateString()}
                        {isOverdue && ' (Overdue)'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <History className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">No recent borrowing activity</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
            <Book className="mr-2 h-5 w-5" />
            Add New Book
          </button>
          <button className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200">
            <Users className="mr-2 h-5 w-5" />
            Add New Member
          </button>
          <button className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200">
            <History className="mr-2 h-5 w-5" />
            View All History
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;