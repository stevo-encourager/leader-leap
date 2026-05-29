
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
        <div className="bg-encourager-accent/10 border border-encourager-accent/30 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-normal text-black mb-3">
            Sign Up to View Your Results
          </h3>
          <div className="space-y-2 text-sm">
            <ul className="space-y-2 ml-4">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Create your account to access your personalised leadership assessment results</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Download your report and create an action plan</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>We won't contact you unless you opt-in to receive emails</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span className="font-bold text-black">Currently FREE!</span>
              </li>
            </ul>
          </div>
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
