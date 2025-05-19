
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Category, Skill } from '@/utils/assessmentData';

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
          <CardTitle className="text-[#242323]">{category.title}</CardTitle>
          <div className="h-6"></div>
          <CardDescription>{category.description}</CardDescription>
        </CardHeader>
      )}
      <CardContent>
        {category.skills.map((skill) => (
          <div key={skill.id} className="mb-8 pt-6">
            <h4 className="text-lg font-medium mb-2 text-[#242323]">{skill.name}</h4>
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
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Beginner</span>
                  <span>Advanced</span>
                  <span>Expert</span>
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
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Beginner</span>
                  <span>Advanced</span>
                  <span>Expert</span>
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
