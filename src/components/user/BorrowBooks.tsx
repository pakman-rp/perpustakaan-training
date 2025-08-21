import React, { useState } from 'react';
import { Book, Search, Filter, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';

const BorrowBooks: React.FC = () => {
  const { books, borrowBook } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [borrowing, setBorrowing] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const availableBooks = books.filter(book => book.status === 'available');
  const categories = [...new Set(books.map(book => book.category))];

  const filteredBooks = availableBooks.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || book.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleBorrow = async (bookId: string) => {
    if (!user?.id) return;
    
    setBorrowing(bookId);
    setMessage(null);
    
    try {
      const success = await borrowBook(bookId, user.id);
      
      if (success) {
        setMessage({
          type: 'success',
          text: 'Book borrowed successfully! You have 14 days to return it.'
        });
      } else {
        setMessage({
          type: 'error',
          text: 'Failed to borrow book. It may have been borrowed by someone else.'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'An error occurred while borrowing the book. Please try again.'
      });
    } finally {
      setBorrowing(null);
      // Clear message after 5 seconds
      setTimeout(() => setMessage(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Browse & Borrow Books</h2>
        <div className="text-sm text-gray-500">
          {availableBooks.length} books available
        </div>
      </div>

      {/* Message Alert */}
      {message && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-700' 
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <div className="flex items-center">
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2" />
            )}
            <span>{message.text}</span>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search books by title, author, or category..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBooks.map((book) => (
          <div key={book.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-shrink-0 h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Book className="h-6 w-6 text-blue-600" />
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Available
                </span>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {book.title}
              </h3>
              
              <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
              
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {book.category}
                </span>
                <span className="text-xs text-gray-500">ISBN: {book.isbn}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <Clock className="h-4 w-4 mr-1" />
                <span>14 days loan period</span>
              </div>
              
              <button
                onClick={() => handleBorrow(book.id)}
                disabled={borrowing === book.id}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {borrowing === book.id ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Borrowing...
                  </>
                ) : (
                  <>
                    <Book className="h-4 w-4 mr-2" />
                    Borrow Book
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <div className="text-center py-12">
          <Book className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            {searchTerm || categoryFilter !== 'all' 
              ? 'No books found matching your criteria' 
              : 'No books available for borrowing at the moment'
            }
          </p>
          {(searchTerm || categoryFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
              }}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Borrowing Guidelines */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Borrowing Guidelines</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start">
            <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-blue-600" />
            <span>Each book can be borrowed for up to 14 days</span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-blue-600" />
            <span>Late returns incur a fine of Rp10,000 per week</span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-blue-600" />
            <span>Maximum fine is capped at Rp75,000 per book</span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-blue-600" />
            <span>You must have a valid membership to borrow books</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default BorrowBooks;