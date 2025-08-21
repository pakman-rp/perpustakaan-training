import React from 'react';
import { DollarSign, AlertTriangle, CheckCircle, Calendar, Book, CreditCard } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';

const UserFines: React.FC = () => {
  const { fines, borrowRecords, books } = useData();
  const { user } = useAuth();

  const userFines = fines.filter(fine => fine.userId === user?.id);
  const unpaidFines = userFines.filter(fine => !fine.paid);
  const paidFines = userFines.filter(fine => fine.paid);

  const totalUnpaid = unpaidFines.reduce((sum, fine) => sum + fine.amount, 0);
  const totalPaid = paidFines.reduce((sum, fine) => sum + fine.amount, 0);

  const enrichedFines = userFines.map(fine => {
    const borrowRecord = borrowRecords.find(r => r.id === fine.borrowRecordId);
    const book = borrowRecord ? books.find(b => b.id === borrowRecord.bookId) : null;
    return {
      ...fine,
      borrowRecord,
      book
    };
  });

  const sortedFines = enrichedFines.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handlePayFine = (fineId: string) => {
    // In a real application, this would integrate with a payment gateway
    if (window.confirm('This would redirect to payment gateway. Proceed?')) {
      alert('Payment gateway integration would be implemented here.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">My Fines</h2>
        <div className="text-sm text-gray-500">
          Member: {user?.membershipId}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Outstanding Fines</p>
              <p className="text-2xl font-bold text-red-600">Rp {totalUnpaid.toLocaleString()}</p>
              <p className="text-xs text-gray-500">{unpaidFines.length} unpaid fine{unpaidFines.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Paid Fines</p>
              <p className="text-2xl font-bold text-green-600">Rp {totalPaid.toLocaleString()}</p>
              <p className="text-xs text-gray-500">{paidFines.length} paid fine{paidFines.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Fines</p>
              <p className="text-2xl font-bold text-blue-600">Rp {(totalUnpaid + totalPaid).toLocaleString()}</p>
              <p className="text-xs text-gray-500">{userFines.length} total fine{userFines.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Outstanding Fines Alert */}
      {unpaidFines.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start">
            <AlertTriangle className="h-6 w-6 text-red-400 mr-3 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-medium text-red-800 mb-2">
                Outstanding Fines: Rp {totalUnpaid.toLocaleString()}
              </h3>
              <p className="text-sm text-red-700 mb-4">
                You have {unpaidFines.length} unpaid fine{unpaidFines.length !== 1 ? 's' : ''}. 
                Please pay your fines to continue borrowing books from the library.
              </p>
              <button
                onClick={() => handlePayFine('all')}
                className="flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Pay All Fines
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fine Calculation Info */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Fine Calculation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div className="flex items-start">
            <DollarSign className="h-4 w-4 mr-2 mt-0.5 text-blue-600" />
            <div>
              <p className="font-medium">Late Return Fine</p>
              <p>Rp10,000 per week (or part thereof)</p>
            </div>
          </div>
          <div className="flex items-start">
            <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 text-blue-600" />
            <div>
              <p className="font-medium">Maximum Fine</p>
              <p>Capped at Rp75,000 per book</p>
            </div>
          </div>
        </div>
      </div>

      {/* Fines List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Fine History</h3>
        </div>
        
        {sortedFines.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {sortedFines.map((fine) => (
              <div key={fine.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${
                      fine.paid ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {fine.paid ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    
                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Book className="h-5 w-5 text-blue-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-medium text-gray-900">
                        {fine.book?.title || 'Unknown Book'}
                      </p>
                      <p className="text-sm text-gray-600">
                        by {fine.book?.author || 'Unknown Author'}
                      </p>
                      <div className="flex items-center mt-1 space-x-4 text-xs text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Fine Date: {new Date(fine.createdAt).toLocaleDateString()}
                        </div>
                        <div>
                          Reason: {fine.reason}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        fine.paid ? 'text-green-600' : 'text-red-600'
                      }`}>
                        Rp {fine.amount.toLocaleString()}
                      </p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        fine.paid 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {fine.paid ? 'Paid' : 'Unpaid'}
                      </span>
                    </div>
                    
                    {!fine.paid && (
                      <button
                        onClick={() => handlePayFine(fine.id)}
                        className="flex items-center px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors duration-200"
                      >
                        <CreditCard className="h-3 w-3 mr-1" />
                        Pay Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
            <p className="mt-2 text-sm text-gray-600">No fines on your account</p>
            <p className="text-xs text-gray-500">Keep returning books on time to avoid fines!</p>
          </div>
        )}
      </div>

      {/* Payment Methods Info */}
      {unpaidFines.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Methods</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <CreditCard className="h-4 w-4 mr-2 text-gray-500" />
              <span>Credit/Debit Card</span>
            </div>
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
              <span>Bank Transfer</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-gray-500" />
              <span>Cash at Library</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserFines;