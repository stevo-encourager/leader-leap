import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { CircleHelp } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from './ui/tooltip';
import { Category, Skill } from '../utils/assessmentTypes';
import { assessmentLogger } from '@/utils/logger';
import { logger } from '@/utils/productionLogger';

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
  const [tooltipStates, setTooltipStates] = useState<{ [key: string]: boolean }>({});

  const handleRatingChange = (skillId: string, ratingType: 'current' | 'desired', value: number) => {
    // Ensure value is a valid number
    const numericValue = Number(value);
    if (isNaN(numericValue)) {
      assessmentLogger.error('Invalid rating value', { value, skillId, ratingType });
      return;
    }
    
    // Log rating change for debugging
    assessmentLogger.debug('Setting rating', { ratingType, skillId, value: numericValue });
    
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

        onChange(updatedCategory);
      } else {
        logger.error(`LeadershipCategory - Skill not found: ${skillId}`);
      }
    } else {
      logger.warn(`LeadershipCategory - No onChange or onSkillRating handler provided for ${category.title} -> ${skillId}`);
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
          <div className="space-y-8">
            {category.skills.map((skill, index) => (
              <Card key={skill.id} className={`border border-gray-100 shadow-sm ${index === 0 ? 'mt-8' : ''}`}>
                <CardHeader className="pb-2 pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-4">
                      <h4 className="text-lg font-medium text-gray-800">{skill.name}</h4>
                      <p className="text-sm text-gray-600">{skill.description}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <TooltipProvider>
                        <Tooltip open={tooltipStates[skill.id]} onOpenChange={(open) => setTooltipStates(prev => ({ ...prev, [skill.id]: open }))}>
                          <TooltipTrigger asChild>
                            <CircleHelp 
                              className="h-5 w-5 text-gray-600 hover:text-gray-800 cursor-pointer transition-colors" 
                              onClick={() => setTooltipStates(prev => ({ ...prev, [skill.id]: !prev[skill.id] }))}
                            />
                          </TooltipTrigger>
                          <TooltipContent className="w-80" side="left">
                            <div className="text-xs text-slate-500 space-y-1">
                              <p><strong>Current ability:</strong> Rate your current skill level from 1-10</p>
                              <p><strong>Target level:</strong> Set your desired skill level to work towards. Consider context i.e. think about what's truly important for your current role or your next step. Be realistic about where you need to be.</p>
                              <p>You must select a rating for every skill before proceeding.</p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <SkillAssessment 
                    skill={skill} 
                    onRatingChange={(ratingType, value) => handleRatingChange(skill.id, ratingType, value)}
                  />
                </CardContent>
              </Card>
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
    onRatingChange('current', value);
  };
  
  // Handle desired rating change
  const handleDesiredChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    onRatingChange('desired', value);
  };

  return (
    <div className="space-y-6">
      {/* Current Level */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="block text-md font-medium text-gray-700">
            Current ability:
          </label>
          <span className="text-lg font-medium text-encourager">{ratings.current}</span>
        </div>
        <div className="relative">
          <input
            type="range"
            min="0"
            max="10"
            step="1"
            value={ratings.current || 0}
            onChange={handleCurrentChange}
            className="assessment-slider current-ability w-full h-2 bg-transparent appearance-none cursor-pointer"
            style={{
              background: ratings.current === 0 
                ? '#e2e8f0' // Gray when untouched
                : `linear-gradient(to right, #69bda2 0%, #69bda2 ${(ratings.current / 10) * 100}%, #e2e8f0 ${(ratings.current / 10) * 100}%, #e2e8f0 100%)`
            }}
          />
        </div>
        <div className="relative text-xs text-gray-500 mt-1" style={{ height: '16px' }}>
          <span className="absolute transform -translate-x-1/2 left-[20%] md:left-[10%]">Beginner</span>
          <span className="absolute transform -translate-x-1/2 left-[47%] md:left-[40%]">Proficient</span>
          <span className="absolute transform -translate-x-1/2 left-[74%] md:left-[70%]">Advanced</span>
          <span className="absolute transform -translate-x-1/2 left-[98%] md:left-[100%]">Expert</span>
        </div>
      </div>
      
      {/* Desired Level */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="block text-md font-medium text-gray-700">
            Target level:
          </label>
          <span className="text-lg font-medium text-encourager">{ratings.desired}</span>
        </div>
        <div className="relative">
          <input
            type="range"
            min="0"
            max="10"
            step="1"
            value={ratings.desired || 0}
            onChange={handleDesiredChange}
            className="assessment-slider w-full h-2 bg-transparent appearance-none cursor-pointer"
            style={{
              background: ratings.desired === 0 
                ? '#e2e8f0' // Gray when untouched
                : `linear-gradient(to right, #69bda2 0%, #69bda2 ${(ratings.desired / 10) * 100}%, #e2e8f0 ${(ratings.desired / 10) * 100}%, #e2e8f0 100%)`
            }}
          />
        </div>
        <div className="relative text-xs text-gray-500 mt-1" style={{ height: '16px' }}>
          <span className="absolute transform -translate-x-1/2 left-[20%] md:left-[10%]">Beginner</span>
          <span className="absolute transform -translate-x-1/2 left-[47%] md:left-[40%]">Proficient</span>
          <span className="absolute transform -translate-x-1/2 left-[74%] md:left-[70%]">Advanced</span>
          <span className="absolute transform -translate-x-1/2 left-[98%] md:left-[100%]">Expert</span>
        </div>
      </div>

      {/* Visual indicator for the gap between current and desired */}
      <div className="h-1 bg-gray-100 w-full rounded-full mt-2 overflow-hidden">
        <div 
          className="h-full bg-encourager-accent rounded-full"
          style={{ 
            width: `${Math.max(0, (ratings.desired - ratings.current) * 10)}%`,
            marginLeft: `${ratings.current * 10}%`
          }}
        />
      </div>
    </div>
  );
};

export default LeadershipCategory;
