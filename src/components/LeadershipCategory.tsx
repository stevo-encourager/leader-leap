
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Category, Skill } from '../utils/assessmentTypes';

interface LeadershipCategoryProps {
  category: Category;
  onChange?: (updatedCategory: Category) => void;
  onSkillRating?: (categoryId: string, skillId: string, type: 'current' | 'desired', value: number) => void;
  hideHeader?: boolean;
}

const LeadershipCategory: React.FC<LeadershipCategoryProps> = ({ 
  category, 
  onChange,
  onSkillRating,
  hideHeader = false
}) => {
  const [isExpanded, setIsExpanded] = useState(!hideHeader);

  const handleRatingChange = (skillId: string, ratingType: 'current' | 'desired', value: number) => {
    // Ensure value is a valid number
    const numericValue = Number(value);
    if (isNaN(numericValue)) {
      console.error(`LeadershipCategory - Invalid rating value: ${value}`);
      return;
    }
    
    // Log rating change for debugging
    console.log(`LeadershipCategory - Setting ${ratingType} rating for skill ${skillId} to ${numericValue}`);
    
    if (onSkillRating) {
      // Use the onSkillRating prop if provided (new approach)
      onSkillRating(category.id, skillId, ratingType, numericValue);
      return;
    }
    
    // Legacy approach - use onChange prop
    if (onChange) {
      // Create a deep copy of the category to avoid reference issues
      const updatedCategory: Category = JSON.parse(JSON.stringify(category));
      
      // Find the skill and update its rating
      const skillToUpdate = updatedCategory.skills.find(skill => skill.id === skillId);
      if (skillToUpdate) {
        skillToUpdate.ratings[ratingType] = numericValue;
        console.log(`LeadershipCategory - Updated ${category.title} -> ${skillToUpdate.name} -> ${ratingType} = ${numericValue}`);
        onChange(updatedCategory);
      } else {
        console.error(`LeadershipCategory - Skill not found: ${skillId}`);
      }
    } else {
      console.warn(`LeadershipCategory - No onChange or onSkillRating handler provided for ${category.title} -> ${skillId}`);
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Don't render the header when hideHeader is true
  const header = !hideHeader ? (
    <CardHeader 
      className="pb-2 cursor-pointer" 
      onClick={toggleExpanded}
    >
      <CardTitle className="text-lg flex justify-between items-center">
        <span>{category.title}</span>
        <span className="text-sm text-gray-500">
          {isExpanded ? '▲' : '▼'}
        </span>
      </CardTitle>
      <CardDescription>{category.description}</CardDescription>
    </CardHeader>
  ) : null;

  // CRITICAL FIX: Always show content when hideHeader is true, otherwise respect isExpanded state
  const shouldShowContent = hideHeader || isExpanded;

  return (
    <Card className="w-full shadow-sm border border-gray-200 mb-6">
      {header}
      
      {shouldShowContent && (
        <CardContent>
          <div className="space-y-6">
            {category.skills.map((skill) => (
              <SkillAssessment 
                key={skill.id} 
                skill={skill} 
                onRatingChange={(ratingType, value) => handleRatingChange(skill.id, ratingType, value)}
              />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

interface SkillAssessmentProps {
  skill: Skill;
  onRatingChange: (ratingType: 'current' | 'desired', value: number) => void;
}

const SkillAssessment: React.FC<SkillAssessmentProps> = ({ skill, onRatingChange }) => {
  // Ensure skill.ratings is properly initialized
  const ratings = skill.ratings || { current: 0, desired: 0 };
  
  // Handle current rating change
  const handleCurrentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    // Log for debugging
    console.log(`SkillAssessment - Current rating change for ${skill.name}: ${value}`);
    onRatingChange('current', value);
  };
  
  // Handle desired rating change
  const handleDesiredChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    // Log for debugging
    console.log(`SkillAssessment - Desired rating change for ${skill.name}: ${value}`);
    onRatingChange('desired', value);
  };
  
  // Log current skill ratings for debugging
  console.log(`SkillAssessment - Rendering ${skill.name} with ratings:`, {
    current: ratings.current,
    desired: ratings.desired
  });

  return (
    <div className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
      <div className="mb-2">
        <h4 className="text-md font-medium text-gray-800">{skill.name}</h4>
        <p className="text-sm text-gray-600">{skill.description}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {/* Current Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Level: {ratings.current}
          </label>
          <input
            type="range"
            min="0"
            max="10"
            step="1"
            value={ratings.current || 0}
            onChange={handleCurrentChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0</span>
            <span>5</span>
            <span>10</span>
          </div>
        </div>
        
        {/* Desired Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Desired Level: {ratings.desired}
          </label>
          <input
            type="range"
            min="0"
            max="10"
            step="1"
            value={ratings.desired || 0}
            onChange={handleDesiredChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0</span>
            <span>5</span>
            <span>10</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadershipCategory;
