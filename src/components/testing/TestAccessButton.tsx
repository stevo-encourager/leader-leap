
import React from 'react';
import { Button } from '@/components/ui/button';
import { TestTube } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TestAccessButton: React.FC = () => {
  const navigate = useNavigate();

  const handleTestAccess = () => {
    navigate('/results?test=true');
  };

  // Only show in development or localhost
  const showButton = window.location.hostname === 'localhost' || 
                    window.location.hostname.includes('lovable.app') ||
                    window.location.search.includes('dev=true');

  if (!showButton) return null;

  return (
    <Button
      onClick={handleTestAccess}
      variant="outline"
      size="sm"
      className="flex items-center gap-2 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
    >
      <TestTube className="h-4 w-4" />
      AI Test Panel
    </Button>
  );
};

export default TestAccessButton;
