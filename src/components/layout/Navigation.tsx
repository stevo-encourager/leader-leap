
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogIn, History, Home, Bot, Settings, Mail, User } from 'lucide-react';

const Navigation: React.FC = () => {
  const { user, signOut } = useAuth();
  
  // Check if we're in development/staging (not production)
  const isDevelopment = import.meta.env.DEV || 
    (window.location.hostname !== 'leader-leap.com' && 
     window.location.hostname !== 'www.leader-leap.com' &&
     !window.location.hostname.includes('lovable.dev'));
  
  // Check if user is super admin
  const superAdmins = ['steve@encourager.co.uk'];
  const isSuperAdmin = user && superAdmins.some(
    email => email.toLowerCase() === (user.email || '').toLowerCase().trim()
  );
  
  return (
    <nav className="flex justify-between items-center gap-4 py-2 w-full">
      <Link to="/" className="no-underline">
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-2"
        >
          <Home size={16} />
          <span>Home</span>
        </Button>
      </Link>
      
      <div className="flex gap-2">
        {/* Support link - always visible */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-2"
          onClick={() => window.open('mailto:support@encouragercoaching.com', '_blank')}
        >
          <Mail size={16} />
          <span>Support</span>
        </Button>
        
        {user ? (
          <>
            <Link to="/profile" className="no-underline">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center gap-2"
              >
                <User size={16} />
                <span>My Profile</span>
              </Button>
            </Link>
            
            {/* Admin link - only show for super admins */}
            {isSuperAdmin && (
              <Link to="/admin" className="no-underline">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center gap-2 text-red-600 hover:text-red-700"
                >
                  <Settings size={16} />
                  <span>Admin</span>
                </Button>
              </Link>
            )}
            
            {/* AI Test Panel - only show in development/staging for super admins */}
            {isDevelopment && isSuperAdmin && (
              <Link to="/ai-test-panel" className="no-underline">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center gap-2 text-yellow-600 hover:text-yellow-700"
                >
                  <Bot size={16} />
                  <span>AI Test Panel</span>
                </Button>
              </Link>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={signOut}
            >
              <LogIn size={16} />
              <span>Logout</span>
            </Button>
          </>
        ) : (
          <Link to="/login" className="no-underline">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-2"
            >
              <LogIn size={16} />
              <span>Login</span>
            </Button>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
