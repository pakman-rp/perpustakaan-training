import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Book, 
  Users, 
  History, 
  DollarSign, 
  Settings, 
  LogOut,
  Home,
  BookOpen,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const adminNavItems = [
    { path: '/admin', icon: Home, label: 'Dashboard' },
    { path: '/admin/books', icon: Book, label: 'Books' },
    { path: '/admin/members', icon: Users, label: 'Members' },
    { path: '/admin/history', icon: History, label: 'Borrow History' },
  ];

  const userNavItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/borrow', icon: BookOpen, label: 'Borrow Books' },
    { path: '/history', icon: History, label: 'My History' },
    { path: '/fines', icon: DollarSign, label: 'My Fines' },
  ];

  const navItems = user?.role === 'admin' ? adminNavItems : userNavItems;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <div className="flex items-center">
            <Book className="h-8 w-8 text-indigo-600" />
            <span className="ml-2 text-xl font-semibold text-gray-800">Library</span>
          </div>
        </div>

        <nav className="mt-8">
          <div className="px-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive(item.path)
                      ? 'bg-indigo-100 text-indigo-700 border-r-2 border-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">
                {user?.role === 'admin' ? 'Admin Panel' : 'Library Dashboard'}
              </h1>
              <p className="text-sm text-gray-600">
                Welcome back, {user?.username}
                {user?.membershipId && ` (${user.membershipId})`}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <UserCheck className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600 capitalize">
                  {user?.role}
                </span>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;