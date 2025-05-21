
import React from 'react';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';

interface ErrorDisplayProps {
  title: string;
  message: string;
  buttonText: string;
  onButtonClick: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  title,
  message,
  buttonText,
  onButtonClick
}) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-2">
        <Navigation />
      </div>
      <main className="assessment-container max-w-5xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4 text-gray-800">{title}</h1>
          <p className="text-gray-600 mb-6">{message}</p>
          <Button onClick={onButtonClick} className="bg-encourager hover:bg-encourager-light">
            {buttonText}
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ErrorDisplay;
