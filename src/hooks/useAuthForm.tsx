
import { useState, useCallback } from 'react';

/**
 * Hook to manage authentication form visibility
 */
export const useAuthForm = () => {
  const [showAuthForm, setShowAuthForm] = useState(false);
  
  const handleCloseAuthForm = useCallback(() => {
    setShowAuthForm(false);
  }, []);

  const handleShowSignupForm = useCallback(() => {
    setShowAuthForm(true);
  }, []);

  return {
    showAuthForm,
    setShowAuthForm,
    handleCloseAuthForm,
    handleShowSignupForm
  };
};
