
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import TestAccessButton from '@/components/testing/TestAccessButton';

const Navigation = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center space-x-8">
          <Link 
            to="/" 
            className="text-xl font-bold text-slate-900 hover:text-encourager transition-colors"
          >
            Leader Leap
          </Link>
          
          <div className="hidden md:flex space-x-6">
            <Link 
              to="/assessment" 
              className={`text-sm font-medium transition-colors ${
                isActive('/assessment') 
                  ? 'text-encourager border-b-2 border-encourager pb-1' 
                  : 'text-slate-600 hover:text-encourager'
              }`}
            >
              Assessment
            </Link>
            
            {user && (
              <Link 
                to="/previous-assessments" 
                className={`text-sm font-medium transition-colors ${
                  isActive('/previous-assessments') 
                    ? 'text-encourager border-b-2 border-encourager pb-1' 
                    : 'text-slate-600 hover:text-encourager'
                }`}
              >
                My Assessments
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Test Access Button */}
          <TestAccessButton />
          
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">
                Welcome, {user.email}
              </span>
              <Link 
                to="/login" 
                className="text-sm text-slate-600 hover:text-encourager transition-colors"
              >
                Logout
              </Link>
            </div>
          ) : (
            <Link 
              to="/login" 
              className="text-sm text-slate-600 hover:text-encourager transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
