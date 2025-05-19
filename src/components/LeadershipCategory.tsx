
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Category, Skill } from '@/utils/assessmentData';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { HelpCircle } from 'lucide-react';

interface LeadershipCategoryProps {
  category: Category;
  onSkillRating: (categoryId: string, skillId: string, type: 'current' | 'desired', value: number) => void;
  hideHeader?: boolean;
}

const LeadershipCategory: React.FC<LeadershipCategoryProps> = ({ 
  category, 
  onSkillRating,
  hideHeader = false
}) => {
  return (
    <Card className="mb-8">
      {!hideHeader && (
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="text-[#242323]">{category.title}</CardTitle>
            <Popover>
              <PopoverTrigger asChild>
                <button className="inline-flex cursor-help">
                  <HelpCircle size={18} className="text-encourager" />
                </button>
              </PopoverTrigger>
              <PopoverContent 
                className="bg-encourager text-white p-3 z-[9999]"
                side="right"
                align="start"
                sideOffset={10}
              >
                <p>Use the sliding scales below to rate your current ability and desired target level for each skill.</p>
              </PopoverContent>
            </Popover>
          </div>
          <div className="h-6"></div>
          <CardDescription>{category.description}</CardDescription>
        </CardHeader>
      )}
      <CardContent>
        {category.skills.map((skill, index) => (
          <div key={skill.id} className="mb-8 pt-6">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-lg font-medium text-[#242323]">{skill.name}</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-6">{skill.description}</p>
            
            <div className="slider-container">
              <span className="slider-label">Current ability:</span>
              <div className="flex-1 px-2">
                <div className="flex items-center">
                  <div className="flex-1">
                    <Slider
                      defaultValue={[skill.ratings.current]}
                      max={10}
                      step={1}
                      value={[skill.ratings.current]}
                      onValueChange={(value) => onSkillRating(category.id, skill.id, 'current', value[0])}
                      className="mb-2"
                    />
                  </div>
                  <span className="w-8 text-center font-medium ml-2">{skill.ratings.current}</span>
                </div>
                <div className="relative flex text-xs text-muted-foreground mt-1 h-5">
                  <span style={{ position: 'absolute', left: '5%', transform: 'translateX(-50%)' }} className="text-center">Beginner</span>
                  <span style={{ position: 'absolute', left: '35%', transform: 'translateX(-50%)' }} className="text-center">Competent</span>
                  <span style={{ position: 'absolute', left: '65%', transform: 'translateX(-50%)' }} className="text-center">Advanced</span>
                  <span style={{ position: 'absolute', left: '90%', transform: 'translateX(-50%)' }} className="text-center">Expert</span>
                </div>
              </div>
            </div>
            
            <div className="slider-container">
              <span className="slider-label">Target<br />level:</span>
              <div className="flex-1 px-2">
                <div className="flex items-center">
                  <div className="flex-1">
                    <Slider
                      defaultValue={[skill.ratings.desired]}
                      max={10}
                      step={1}
                      value={[skill.ratings.desired]}
                      onValueChange={(value) => onSkillRating(category.id, skill.id, 'desired', value[0])}
                      className="mb-2"
                    />
                  </div>
                  <span className="w-8 text-center font-medium ml-2">{skill.ratings.desired}</span>
                </div>
                <div className="relative flex text-xs text-muted-foreground mt-1 h-5">
                  <span style={{ position: 'absolute', left: '5%', transform: 'translateX(-50%)' }} className="text-center">Beginner</span>
                  <span style={{ position: 'absolute', left: '35%', transform: 'translateX(-50%)' }} className="text-center">Competent</span>
                  <span style={{ position: 'absolute', left: '65%', transform: 'translateX(-50%)' }} className="text-center">Advanced</span>
                  <span style={{ position: 'absolute', left: '90%', transform: 'translateX(-50%)' }} className="text-center">Expert</span>
                </div>
              </div>
            </div>
            
            <div className="skill-rating mt-2">
              <div 
                className="skill-gap" 
                style={{ 
                  width: `${skill.ratings.current * 10}%`,
                  backgroundColor: 'rgba(139, 172, 165, 0.2)' // Changed to #8baca5 with opacity
                }}
              ></div>
              <div 
                className="absolute top-0 h-full border-r-2 border-secondary" 
                style={{ left: `${skill.ratings.desired * 10}%` }}
              ></div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default LeadershipCategory;
