export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  membershipId?: string;
  createdAt: Date;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  status: 'available' | 'borrowed';
  borrowedBy?: string;
  borrowedAt?: Date;
  dueDate?: Date;
  version: number; // For optimistic locking
  createdAt: Date;
  updatedAt: Date;
}

export interface BorrowRecord {
  id: string;
  bookId: string;
  userId: string;
  borrowedAt: Date;
  dueDate: Date;
  returnedAt?: Date;
  status: 'active' | 'returned' | 'overdue';
  fineAmount: number;
  finePaid: boolean;
}

export interface Fine {
  id: string;
  userId: string;
  borrowRecordId: string;
  amount: number;
  reason: string;
  paid: boolean;
  createdAt: Date;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}