
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogIn, Home, Bot, Settings, Mail, User, Menu, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useIsMobile } from '@/hooks/use-mobile';

const Navigation: React.FC = () => {
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();
  
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

  // Desktop Navigation (unchanged)
  if (!isMobile) {
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
  }

  // Mobile Navigation with Dropdown Menu
  return (
    <nav className="flex justify-between items-center py-2 w-full">
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
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-1 p-2"
          >
            <Menu size={18} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-48 bg-white border shadow-lg z-50"
        >
          {/* Support - always visible */}
          <DropdownMenuItem 
            onClick={() => window.open('mailto:support@encouragercoaching.com', '_blank')}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Mail size={16} />
            <span>Support</span>
          </DropdownMenuItem>
          
          {user ? (
            <>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem asChild>
                <Link to="/profile" className="flex items-center gap-2 w-full">
                  <User size={16} />
                  <span>My Profile</span>
                </Link>
              </DropdownMenuItem>
              
              {/* Admin link - only show for super admins */}
              {isSuperAdmin && (
                <DropdownMenuItem asChild>
                  <Link to="/admin" className="flex items-center gap-2 w-full text-red-600">
                    <Settings size={16} />
                    <span>Admin</span>
                  </Link>
                </DropdownMenuItem>
              )}
              
              {/* AI Test Panel - only show in development/staging for super admins */}
              {isDevelopment && isSuperAdmin && (
                <DropdownMenuItem asChild>
                  <Link to="/ai-test-panel" className="flex items-center gap-2 w-full text-yellow-600">
                    <Bot size={16} />
                    <span>AI Test Panel</span>
                  </Link>
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={signOut}
                className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
              >
                <LogIn size={16} />
                <span>Logout</span>
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/login" className="flex items-center gap-2 w-full">
                  <LogIn size={16} />
                  <span>Login</span>
                </Link>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
};

export default Navigation;
