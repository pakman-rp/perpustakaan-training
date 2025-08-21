import React from 'react';
import { Book, History, DollarSign, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';

const UserDashboard: React.FC = () => {
  const { books, borrowRecords, fines } = useData();
  const { user } = useAuth();

  const userBorrows = borrowRecords.filter(record => record.userId === user?.id);
  const activeBorrows = userBorrows.filter(record => record.status === 'active');
  const userFines = fines.filter(fine => fine.userId === user?.id);
  const unpaidFines = userFines.filter(fine => !fine.paid);

  const overdueBorrows = activeBorrows.filter(record => new Date() > record.dueDate);

  const stats = {
    currentBorrows: activeBorrows.length,
    totalBorrows: userBorrows.length,
    overdue: overdueBorrows.length,
    totalFines: unpaidFines.reduce((sum, fine) => sum + fine.amount, 0)
  };

  const recentBorrows = userBorrows
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
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome back, {user?.username}!</h2>
          <p className="text-gray-600">Member ID: {user?.membershipId}</p>
        </div>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Alert for overdue books */}
      {overdueBorrows.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-red-800">
                You have {overdueBorrows.length} overdue book{overdueBorrows.length > 1 ? 's' : ''}
              </h3>
              <p className="text-sm text-red-700 mt-1">
                Please return them as soon as possible to avoid additional fines.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Current Borrows"
          value={stats.currentBorrows}
          icon={<Book className="h-6 w-6 text-blue-600" />}
          color="#3B82F6"
          subtitle="Books in your possession"
        />
        
        <StatCard
          title="Total Borrowed"
          value={stats.totalBorrows}
          icon={<History className="h-6 w-6 text-green-600" />}
          color="#10B981"
          subtitle="All time"
        />
        
        <StatCard
          title="Overdue Books"
          value={stats.overdue}
          icon={<Clock className="h-6 w-6 text-red-600" />}
          color="#EF4444"
          subtitle={stats.overdue > 0 ? "Action required" : "All good!"}
        />
        
        <StatCard
          title="Outstanding Fines"
          value={`Rp ${stats.totalFines.toLocaleString()}`}
          icon={<DollarSign className="h-6 w-6 text-yellow-600" />}
          color="#F59E0B"
          subtitle={stats.totalFines === 0 ? "No fines" : "Please pay"}
        />
      </div>

      {/* Current Borrows */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Currently Borrowed Books</h3>
        </div>
        <div className="p-6">
          {activeBorrows.length > 0 ? (
            <div className="space-y-4">
              {activeBorrows.map((record) => {
                const book = books.find(b => b.id === record.bookId);
                const isOverdue = new Date() > record.dueDate;
                const daysUntilDue = Math.ceil((record.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <div key={record.id} className={`p-4 rounded-lg border-2 ${
                    isOverdue ? 'border-red-200 bg-red-50' : 
                    daysUntilDue <= 3 ? 'border-yellow-200 bg-yellow-50' : 
                    'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${
                          isOverdue ? 'bg-red-100' : 
                          daysUntilDue <= 3 ? 'bg-yellow-100' : 
                          'bg-blue-100'
                        }`}>
                          <Book className={`h-5 w-5 ${
                            isOverdue ? 'text-red-600' : 
                            daysUntilDue <= 3 ? 'text-yellow-600' : 
                            'text-blue-600'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{book?.title || 'Unknown Book'}</p>
                          <p className="text-sm text-gray-600">by {book?.author || 'Unknown Author'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          Due: {new Date(record.dueDate).toLocaleDateString()}
                        </p>
                        <p className={`text-xs ${
                          isOverdue ? 'text-red-600 font-medium' : 
                          daysUntilDue <= 3 ? 'text-yellow-600 font-medium' : 
                          'text-gray-500'
                        }`}>
                          {isOverdue ? 
                            `Overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) > 1 ? 's' : ''}` :
                            daysUntilDue <= 3 ?
                            `Due in ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''}` :
                            `${daysUntilDue} days remaining`
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
              <p className="mt-2 text-sm text-gray-600">No books currently borrowed</p>
              <p className="text-xs text-gray-500">Visit the Borrow Books section to find something to read!</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Borrowing History</h3>
        </div>
        <div className="p-6">
          {recentBorrows.length > 0 ? (
            <div className="space-y-4">
              {recentBorrows.map((record) => {
                const book = books.find(b => b.id === record.bookId);
                
                return (
                  <div key={record.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${
                        record.status === 'returned' ? 'bg-green-100' : 
                        record.status === 'active' ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <Book className={`h-5 w-5 ${
                          record.status === 'returned' ? 'text-green-600' : 
                          record.status === 'active' ? 'text-blue-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{book?.title || 'Unknown Book'}</p>
                        <p className="text-sm text-gray-600">by {book?.author || 'Unknown Author'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(record.borrowedAt).toLocaleDateString()}
                      </p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        record.status === 'returned' ? 'bg-green-100 text-green-800' : 
                        record.status === 'active' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {record.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <History className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">No borrowing history yet</p>
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
            Browse Books
          </button>
          <button className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200">
            <History className="mr-2 h-5 w-5" />
            View History
          </button>
          <button className="flex items-center justify-center px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200">
            <DollarSign className="mr-2 h-5 w-5" />
            Check Fines
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;