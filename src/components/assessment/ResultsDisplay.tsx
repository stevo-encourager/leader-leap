
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
        console.log(`Category ${i}: ${category.title}, Skills: ${category.skills?.length || 0}`);
        
        if (category.skills) {
          category.skills.forEach((skill, j) => {
            // Verify ratings exist and are numbers
            const current = skill.ratings?.current;
            const desired = skill.ratings?.desired;
            const skillName = skill.name || (skill as any).competency;
            console.log(`Skill ${j}: ${skillName}, ` + 
                       `Ratings: ${skill.ratings ? `current=${current}, desired=${desired}` : "Missing"}`);
            
            if (!skill.ratings || (isNaN(Number(current)) || isNaN(Number(desired)))) {
              console.error(`Invalid ratings for skill:`, skill);
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
    if (!category.skills || !Array.isArray(category.skills)) {
      return {
        ...category,
        skills: []
      };
    }
    
    const normalizedSkills = category.skills.map(skill => {
      // Create a normalized skill object
      let normalizedSkill: Skill = { ...skill };
      
      // Handle the case where competency is used instead of name
      if (!skill.name && (skill as any).competency) {
        normalizedSkill.name = (skill as any).competency;
      }
      
      // Ensure ratings exist and are numbers
      if (!normalizedSkill.ratings) {
        normalizedSkill.ratings = { current: 0, desired: 0 };
      } else {
        // Convert string ratings to numbers if needed
        if (typeof normalizedSkill.ratings.current !== 'number') {
          normalizedSkill.ratings.current = Number(normalizedSkill.ratings.current) || 0;
        }
        if (typeof normalizedSkill.ratings.desired !== 'number') {
          normalizedSkill.ratings.desired = Number(normalizedSkill.ratings.desired) || 0;
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

  console.log("Normalized categories:", normalizedCategories);

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
