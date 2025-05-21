
import React, { useEffect } from 'react';
import ResultsDashboard from '../ResultsDashboard';
import { Category, Demographics, Skill } from '../../utils/assessmentTypes';

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
    console.log("ResultsDisplay - Categories received:", categories);
  }, [categories]);

  // Check if categories is valid before rendering
  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    return (
      <div className="p-6 text-center border border-red-200 rounded-lg bg-red-50">
        <p className="text-lg text-red-500 mb-4">Unable to display results: Invalid assessment data</p>
        <p className="text-sm text-gray-600 mb-4">This may be due to incomplete assessment data or a problem during the assessment process.</p>
        <button 
          className="bg-encourager hover:bg-encourager-light text-white px-4 py-2 rounded"
          onClick={onRestart}
        >
          Start New Assessment
        </button>
      </div>
    );
  }

  // Map any skills with 'competency' instead of 'name' if needed
  const normalizedCategories = categories.map(category => {
    if (!category) {
      console.error("Found undefined category in categories array");
      return {
        id: `category-${Math.random().toString(36).substring(2, 9)}`,
        title: "Unknown Category",
        description: "",
        skills: []
      };
    }
    
    if (!category.skills || !Array.isArray(category.skills)) {
      console.warn(`Category ${category.title} has no skills or skills is not an array`);
      return {
        ...category,
        skills: []
      };
    }
    
    const normalizedSkills = category.skills.map(skill => {
      if (!skill) {
        console.error(`Found undefined skill in category ${category.title}`);
        return {
          id: `skill-${Math.random().toString(36).substring(2, 9)}`,
          name: "Unknown Skill",
          description: "",
          ratings: { current: 0, desired: 0 }
        };
      }
      
      // Create a normalized skill object
      let normalizedSkill: Skill = { ...skill };
      
      // Handle the case where competency is used instead of name
      if (!skill.name && (skill as any).competency) {
        normalizedSkill.name = (skill as any).competency;
      }
      
      // Ensure skill has a name
      if (!normalizedSkill.name) {
        normalizedSkill.name = "Unnamed Skill";
      }
      
      // Ensure ratings exist and are numbers
      if (!normalizedSkill.ratings) {
        console.warn(`No ratings for skill ${normalizedSkill.name} in ${category.title}`);
        normalizedSkill.ratings = { current: 0, desired: 0 };
      } else {
        // Convert string ratings to numbers if needed
        if (typeof normalizedSkill.ratings.current !== 'number') {
          const parsedCurrent = Number(normalizedSkill.ratings.current);
          normalizedSkill.ratings.current = isNaN(parsedCurrent) ? 0 : parsedCurrent;
        }
        if (typeof normalizedSkill.ratings.desired !== 'number') {
          const parsedDesired = Number(normalizedSkill.ratings.desired);
          normalizedSkill.ratings.desired = isNaN(parsedDesired) ? 0 : parsedDesired;
        }
      }
      
      // Ensure skill has an ID
      if (!normalizedSkill.id) {
        normalizedSkill.id = `skill-${Math.random().toString(36).substring(2, 9)}`;
      }
      
      return normalizedSkill;
    });
    
    return { ...category, skills: normalizedSkills };
  });

  return (
    <ResultsDashboard 
      categories={normalizedCategories}
      demographics={demographics || {}}
      onRestart={onRestart}
      onBack={onBack}
      onSignup={!isAuthenticated ? onSignup : undefined}
    />
  );
};

export default ResultsDisplay;
