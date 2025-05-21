
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
    console.log("ResultsDisplay categories:", categories);
    
    // Validate categories data
    if (!categories || !Array.isArray(categories)) {
      console.error("Invalid categories data:", categories);
    } else {
      console.log("Categories count:", categories.length);
      categories.forEach((category, i) => {
        console.log(`Category ${i}:`, category.title, "Skills:", category.skills?.length || 0);
        
        if (category.skills) {
          category.skills.forEach((skill, j) => {
            // Check if the skill object has expected properties
            if (!skill.name && (skill as any).competency) {
              console.log(`Skill ${j} uses 'competency' instead of 'name':`, (skill as any).competency);
            } else {
              console.log(`Skill ${j}:`, skill.name, "Ratings:", skill.ratings ? "Yes" : "No");
            }
          });
        }
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

  // Map any skills with 'competency' instead of 'name' if needed
  const normalizedCategories = categories.map(category => {
    if (!category.skills || !Array.isArray(category.skills)) return category;
    
    const normalizedSkills = category.skills.map(skill => {
      if (!skill.name && (skill as any).competency) {
        // Create a new skill object with the correct property name
        const normalizedSkill: Skill = {
          ...skill,
          name: (skill as any).competency,
        };
        return normalizedSkill;
      }
      return skill;
    });
    
    return { ...category, skills: normalizedSkills };
  });

  // Additional validation for skills and ratings
  const hasValidSkills = normalizedCategories.every(category => 
    category.skills && 
    Array.isArray(category.skills) && 
    category.skills.length > 0
  );

  const hasValidRatings = normalizedCategories.every(category =>
    category.skills && 
    category.skills.every(skill => 
      skill.ratings && 
      typeof skill.ratings.current === 'number' && 
      typeof skill.ratings.desired === 'number'
    )
  );

  if (!hasValidSkills || !hasValidRatings) {
    return (
      <div className="p-6 text-center">
        <p className="text-lg text-red-500 mb-4">
          Unable to display results: Assessment data is incomplete or in an incorrect format
        </p>
      </div>
    );
  }

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
