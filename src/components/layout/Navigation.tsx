
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogIn, History, Home } from 'lucide-react';

const Navigation: React.FC = () => {
  const { user } = useAuth();
  
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
        {user ? (
          <Link to="/previous-assessments" className="no-underline">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-2"
            >
              <History size={16} />
              <span>Previous Assessments</span>
            </Button>
          </Link>
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
