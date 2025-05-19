
import React from 'react';
import { BookOpen } from 'lucide-react';
import { Category } from '../../utils/assessmentData';

interface KeyInsightsProps {
  averageGap: number;
  topGapSkills: Array<{
    id: string;
    name: string;
    categoryTitle: string;
    gap: number;
    ratings: {
      current: number;
      desired: number;
    };
  }>;
  strengths: Array<{
    id: string;
    name: string;
    categoryTitle: string;
    ratings: {
      current: number;
      desired: number;
    };
  }>;
  lowestSkills: Array<{
    id: string;
    name: string;
    categoryTitle: string;
    ratings: {
      current: number;
      desired: number;
    };
  }>;
}

const KeyInsights: React.FC<KeyInsightsProps> = ({ 
  averageGap, 
  strengths,
  lowestSkills
}) => {
  return (
    <div className="bg-encourager/5 p-4 rounded-lg border border-encourager/20">
      <div className="flex items-start gap-3">
        <BookOpen className="text-encourager h-5 w-5 mt-1" />
        <div>
          <h3 className="text-lg font-medium mb-2">Key Insights</h3>
          
          <div className="bg-primary/5 p-4 rounded-lg mb-4">
            <p className="text-sm">
              Based on your assessment, your average skill gap is <span className="font-bold">{averageGap.toFixed(2)}</span> points.
              This indicates the typical difference between your current abilities and how important these skills are to your role.
            </p>
          </div>
          
          <h4 className="text-md font-medium mt-3 mb-2">Your Highest Scoring Leadership Competencies</h4>
          <div className="space-y-3 mb-4">
            {strengths.map((strength) => (
              <div key={`strength-${strength.id}`} className="bg-secondary/10 p-3 rounded-lg">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{strength.name}</p>
                    <p className="text-sm text-slate-500">{strength.categoryTitle}</p>
                  </div>
                  <div className="bg-green-500 text-white px-2 py-1 rounded-full h-fit text-xs font-medium">
                    Score: {(strength.ratings.current || 0).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <h4 className="text-md font-medium mt-4 mb-2">Your Lowest Scoring Leadership Competencies</h4>
          <div className="space-y-3 mb-4">
            {lowestSkills.map((skill) => (
              <div key={`lowest-${skill.id}`} className="bg-secondary/10 p-3 rounded-lg">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{skill.name}</p>
                    <p className="text-sm text-slate-500">{skill.categoryTitle}</p>
                  </div>
                  <div className="bg-red-500 text-white px-2 py-1 rounded-full h-fit text-xs font-medium">
                    Score: {(skill.ratings.current || 0).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <h4 className="text-md font-medium mt-4 mb-2">Recommended Next Steps</h4>
          <ul className="list-disc list-inside space-y-2 text-slate-700">
            <li>Focus on developing your top gap areas through targeted learning opportunities</li>
            <li>Consider seeking a mentor who excels in your development areas</li>
            <li>Create a 30-day action plan to address your most critical skill gaps</li>
            <li>Re-assess in 3-6 months to measure your progress</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default KeyInsights;
