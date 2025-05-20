
import React from 'react';
import { BookOpen } from 'lucide-react';
import { SkillWithMetadata } from '@/utils/assessmentCalculations';

interface KeyInsightsProps {
  averageGap: number;
  strengths: SkillWithMetadata[];
  lowestSkills: SkillWithMetadata[];
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
              Based on your assessment, your average competency gap is <span className="font-bold">{averageGap.toFixed(2)}</span> points.
              This indicates the typical difference between your current abilities and how important these competencies are to your role.
            </p>
          </div>
          
          <h4 className="text-md font-medium mt-3 mb-2">Your Smallest Competency Gaps</h4>
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
          
          <h4 className="text-md font-medium mt-4 mb-2">Your Biggest Competency Gaps (areas that need the greatest improvement)</h4>
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
            <li>Consider using this report in your next 1:1 with your manager or mentor as a guide for your professional development</li>
            <li>Create a 6 month action plan to address your most critical competency gaps and schedule a time to re-take this assessment to track your progress</li>
            <li>Focus on developing your Biggest Competency Gaps through targeted learning opportunities and stretch assignments</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default KeyInsights;
