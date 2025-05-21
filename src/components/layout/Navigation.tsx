
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogIn, History, Home } from 'lucide-react';

const Navigation: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const handleNavigation = (path: string) => {
    console.log(`Navigating to: ${path}`);
    navigate(path);
  };
  
  return (
    <nav className="flex justify-between items-center gap-4 py-2 w-full">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => handleNavigation('/')} 
        className="flex items-center gap-2"
      >
        <Home size={16} />
        <span>Home</span>
      </Button>
      
      <div className="flex gap-2">
        {user ? (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleNavigation('/previous-assessments')} 
            className="flex items-center gap-2"
          >
            <History size={16} />
            <span>Previous Assessments</span>
          </Button>
        ) : (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleNavigation('/login')} 
            className="flex items-center gap-2"
          >
            <LogIn size={16} />
            <span>Login</span>
          </Button>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
