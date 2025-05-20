
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogIn, History } from 'lucide-react';

const Navigation: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <nav className="flex justify-end items-center gap-4 py-1">
      {user ? (
        <Button variant="ghost" size="sm" asChild className="flex items-center gap-2">
          <Link to="/previous-assessments">
            <History size={16} />
            <span>Previous Assessments</span>
          </Link>
        </Button>
      ) : (
        <Button variant="ghost" size="sm" asChild className="flex items-center gap-2">
          <Link to="/login">
            <LogIn size={16} />
            <span>Login</span>
          </Link>
        </Button>
      )}
    </nav>
  );
};

export default Navigation;
