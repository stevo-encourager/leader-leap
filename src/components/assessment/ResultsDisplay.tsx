
import React, { useEffect } from 'react';
import ResultsDashboard from '../ResultsDashboard';
import { Category, Demographics } from '../../utils/assessmentTypes';

interface ResultsDisplayProps {
  categories: Category[];
  demographics: Demographics;
  onRestart: () => void;
  onBack: () => void;
  onSignup: () => void;
  isAuthenticated: boolean;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  categories,
  demographics,
  onRestart,
  onBack,
  onSignup,
  isAuthenticated
}) => {
  useEffect(() => {
    console.log("ResultsDisplay categories:", categories);
    
    // Validate categories data
    if (!categories || !Array.isArray(categories)) {
      console.error("Invalid categories data:", categories);
    } else {
      console.log("Categories count:", categories.length);
      categories.forEach((category, i) => {
        console.log(`Category ${i}:`, category.title, "Skills:", category.skills?.length || 0);
      });
    }
  }, [categories]);

  // Check if categories is valid before rendering
  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-lg text-red-500 mb-4">Unable to display results: Invalid assessment data</p>
      </div>
    );
  }

  return (
    <ResultsDashboard 
      categories={categories}
      demographics={demographics || {}}
      onRestart={onRestart}
      onBack={onBack}
      onSignup={!isAuthenticated ? onSignup : undefined}
    />
  );
};

export default ResultsDisplay;
