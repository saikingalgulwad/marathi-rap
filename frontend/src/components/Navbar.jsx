import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { Bell, User, LogOut, Menu, X } from 'lucide-react';

const Navbar = ({ notifications = [] }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-blue rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <span className="text-xl font-bold text-gray-900" style={{fontFamily: 'Space Grotesk'}}>AutoApply</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium transition-colors" data-testid="nav-dashboard">
              Dashboard
            </Link>
            <Link to="/jobs" className="text-gray-700 hover:text-blue-600 font-medium transition-colors" data-testid="nav-jobs">
              Jobs
            </Link>
            <Link to="/resume" className="text-gray-700 hover:text-blue-600 font-medium transition-colors" data-testid="nav-resume">
              Resume
            </Link>
            <Link to="/applications" className="text-gray-700 hover:text-blue-600 font-medium transition-colors" data-testid="nav-applications">
              Applications
            </Link>
            <Link to="/auto-apply" className="text-gray-700 hover:text-blue-600 font-medium transition-colors" data-testid="nav-auto-apply">
              Auto-Apply
            </Link>
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-600 hover:text-blue-600 relative transition-colors"
                data-testid="notifications-button"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="notification-badge" data-testid="notification-count">{unreadCount}</span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto" data-testid="notifications-dropdown">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">No notifications</div>
                  ) : (
                    <div>
                      {notifications.slice(0, 5).map((notif) => (
                        <div key={notif.id} className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${!notif.read ? 'bg-blue-50' : ''}`} data-testid="notification-item">
                          <p className="text-sm text-gray-900">{notif.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{new Date(notif.created_at).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 text-gray-600 hover:text-blue-600 transition-colors"
                data-testid="user-menu-button"
              >
                <User size={20} />
                <span className="hidden md:inline text-sm font-medium">{user?.full_name}</span>
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200" data-testid="user-menu-dropdown">
                  <Link to="/profile" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors" data-testid="profile-link">
                    Profile Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors"
                    data-testid="logout-button"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600"
              data-testid="mobile-menu-button"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200" data-testid="mobile-menu">
          <div className="px-4 py-2 space-y-1">
            <Link to="/dashboard" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg" data-testid="mobile-nav-dashboard">
              Dashboard
            </Link>
            <Link to="/jobs" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg" data-testid="mobile-nav-jobs">
              Jobs
            </Link>
            <Link to="/resume" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg" data-testid="mobile-nav-resume">
              Resume
            </Link>
            <Link to="/applications" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg" data-testid="mobile-nav-applications">
              Applications
            </Link>
            <Link to="/auto-apply" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg" data-testid="mobile-nav-auto-apply">
              Auto-Apply
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;