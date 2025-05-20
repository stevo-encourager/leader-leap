
import React from 'react';
import AuthForm from '../auth/AuthForm';
import { Button } from '@/components/ui/button';

interface AuthSectionProps {
  onClose: () => void;
}

const AuthSection: React.FC<AuthSectionProps> = ({ onClose }) => {
  return (
    <div className="mb-8">
      <AuthForm onSuccess={onClose} showGoogleAuth={false} />
      <div className="text-center mt-4">
        <Button variant="ghost" onClick={onClose}>
          Skip Sign Up for Now
        </Button>
      </div>
    </div>
  );
};

export default AuthSection;
