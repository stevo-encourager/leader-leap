
import React from 'react';
import AuthForm from '../auth/AuthForm';
import { Button } from '@/components/ui/button';

interface AuthSectionProps {
  onClose: () => void;
  mandatory?: boolean;
}

const AuthSection: React.FC<AuthSectionProps> = ({ onClose, mandatory = false }) => {
  return (
    <div className="mb-8">
      {mandatory && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Sign Up to View Your Results
          </h3>
          <p className="text-blue-800 text-sm">
            <strong>Completely FREE!</strong> Create your account to access your personalized leadership assessment results, 
            download your report, and save your progress.
          </p>
        </div>
      )}
      
      <AuthForm 
        onSuccess={onClose} 
        showGoogleAuth={true} 
        defaultTab={mandatory ? 'signup' : 'signin'}
      />
      
      {!mandatory && (
        <div className="text-center mt-4">
          <Button variant="ghost" onClick={onClose}>
            Skip Sign Up for Now
          </Button>
        </div>
      )}
    </div>
  );
};

export default AuthSection;
