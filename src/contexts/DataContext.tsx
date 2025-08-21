import React, { createContext, useContext, useState, useEffect } from 'react';
import { Book, BorrowRecord, Fine, User } from '../types';

interface DataContextType {
  books: Book[];
  borrowRecords: BorrowRecord[];
  fines: Fine[];
  members: User[];
  refreshData: () => void;
  addBook: (book: Omit<Book, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => void;
  updateBook: (id: string, updates: Partial<Book>) => void;
  deleteBook: (id: string) => void;
  borrowBook: (bookId: string, userId: string) => Promise<boolean>;
  returnBook: (borrowRecordId: string) => void;
  addMember: (member: Omit<User, 'id' | 'createdAt'>) => void;
  calculateFine: (dueDate: Date) => number;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Mock data for demonstration
const mockBooks: Book[] = [
  {
    id: '1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    isbn: '978-0-7432-7356-5',
    category: 'Fiction',
    status: 'available',
    version: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    isbn: '978-0-06-112008-4',
    category: 'Fiction',
    status: 'borrowed',
    borrowedBy: 'user1',
    borrowedAt: new Date('2024-01-15'),
    dueDate: new Date('2024-02-15'),
    version: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '3',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    isbn: '978-0-13-235088-4',
    category: 'Technology',
    status: 'available',
    version: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

const mockMembers: User[] = [
  {
    id: 'user1',
    username: 'user1',
    email: 'user1@example.com',
    role: 'user',
    membershipId: 'MEM001',
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'user2',
    username: 'user2',
    email: 'user2@example.com',
    role: 'user',
    membershipId: 'MEM002',
    createdAt: new Date('2024-01-01')
  }
];

const mockBorrowRecords: BorrowRecord[] = [
  {
    id: '1',
    bookId: '2',
    userId: 'user1',
    borrowedAt: new Date('2024-01-15'),
    dueDate: new Date('2024-02-15'),
    status: 'active',
    fineAmount: 0,
    finePaid: false
  }
];

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<Book[]>(mockBooks);
  const [borrowRecords, setBorrowRecords] = useState<BorrowRecord[]>(mockBorrowRecords);
  const [fines, setFines] = useState<Fine[]>([]);
  const [members, setMembers] = useState<User[]>(mockMembers);

  const refreshData = () => {
    // In a real app, this would fetch fresh data from the API
    console.log('Refreshing data...');
  };

  const addBook = (bookData: Omit<Book, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => {
    const newBook: Book = {
      ...bookData,
      id: Date.now().toString(),
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setBooks(prev => [...prev, newBook]);
  };

  const updateBook = (id: string, updates: Partial<Book>) => {
    setBooks(prev => prev.map(book => 
      book.id === id 
        ? { ...book, ...updates, version: book.version + 1, updatedAt: new Date() }
        : book
    ));
  };

  const deleteBook = (id: string) => {
    setBooks(prev => prev.filter(book => book.id !== id));
  };

  const borrowBook = async (bookId: string, userId: string): Promise<boolean> => {
    // Simulate race condition handling with optimistic locking
    const book = books.find(b => b.id === bookId);
    if (!book || book.status !== 'available') {
      return false;
    }

    // Simulate concurrent access check
    await new Promise(resolve => setTimeout(resolve, 100));

    const updatedBook = books.find(b => b.id === bookId);
    if (!updatedBook || updatedBook.status !== 'available' || updatedBook.version !== book.version) {
      return false; // Race condition detected
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // 2 weeks loan period

    const borrowRecord: BorrowRecord = {
      id: Date.now().toString(),
      bookId,
      userId,
      borrowedAt: new Date(),
      dueDate,
      status: 'active',
      fineAmount: 0,
      finePaid: false
    };

    setBorrowRecords(prev => [...prev, borrowRecord]);
    updateBook(bookId, {
      status: 'borrowed',
      borrowedBy: userId,
      borrowedAt: new Date(),
      dueDate
    });

    return true;
  };

  const returnBook = (borrowRecordId: string) => {
    const record = borrowRecords.find(r => r.id === borrowRecordId);
    if (!record) return;

    const fine = calculateFine(record.dueDate);
    
    setBorrowRecords(prev => prev.map(r => 
      r.id === borrowRecordId 
        ? { ...r, returnedAt: new Date(), status: 'returned', fineAmount: fine }
        : r
    ));

    updateBook(record.bookId, {
      status: 'available',
      borrowedBy: undefined,
      borrowedAt: undefined,
      dueDate: undefined
    });

    if (fine > 0) {
      const newFine: Fine = {
        id: Date.now().toString(),
        userId: record.userId,
        borrowRecordId,
        amount: fine,
        reason: 'Late return',
        paid: false,
        createdAt: new Date()
      };
      setFines(prev => [...prev, newFine]);
    }
  };

  const addMember = (memberData: Omit<User, 'id' | 'createdAt'>) => {
    const newMember: User = {
      ...memberData,
      id: Date.now().toString(),
      membershipId: `MEM${String(members.length + 1).padStart(3, '0')}`,
      createdAt: new Date()
    };
    setMembers(prev => [...prev, newMember]);
  };

  const calculateFine = (dueDate: Date): number => {
    const now = new Date();
    const diffTime = now.getTime() - dueDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 0;
    
    const weeks = Math.ceil(diffDays / 7);
    const fineAmount = weeks * 10000; // Rp10.000 per week
    
    return Math.min(fineAmount, 75000); // Max Rp75.000
  };

  const value = {
    books,
    borrowRecords,
    fines,
    members,
    refreshData,
    addBook,
    updateBook,
    deleteBook,
    borrowBook,
    returnBook,
    addMember,
    calculateFine
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};