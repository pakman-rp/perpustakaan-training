import { LoginCredentials, User, ApiResponse } from '../types';

// Mock API implementation for demonstration
// In production, replace with actual API calls

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock users database
const mockUsers: User[] = [
  {
    id: 'admin',
    username: 'admin',
    email: 'admin@library.com',
    role: 'admin',
    createdAt: new Date('2024-01-01')
  },
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

export const authApi = {
  async login(credentials: LoginCredentials): Promise<ApiResponse<User>> {
    await delay(500); // Simulate network delay
    
    // Input sanitization (basic XSS prevention)
    const sanitizedUsername = credentials.username.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // Mock authentication - in production, use proper password hashing
    const user = mockUsers.find(u => 
      u.username === sanitizedUsername && 
      credentials.password === 'password123' // Mock password
    );
    
    if (user) {
      return {
        success: true,
        data: user,
        message: 'Login successful'
      };
    }
    
    return {
      success: false,
      error: 'Invalid credentials'
    };
  },

  async logout(): Promise<ApiResponse<void>> {
    await delay(200);
    return {
      success: true,
      message: 'Logout successful'
    };
  }
};

// Rate limiting simulation
let requestCount = 0;
const resetTime = Date.now() + 60000; // Reset every minute

export const rateLimit = {
  check(): boolean {
    if (Date.now() > resetTime) {
      requestCount = 0;
    }
    
    if (requestCount >= 100) { // Max 100 requests per minute
      return false;
    }
    
    requestCount++;
    return true;
  }
};

// CSRF token simulation
export const csrfToken = {
  generate(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  },
  
  validate(token: string): boolean {
    // In production, validate against server-side token
    return token.length > 10;
  }
};