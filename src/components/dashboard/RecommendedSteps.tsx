
import React from 'react';
import { ListCheck } from 'lucide-react';
import SectionHeader from '../introduction/SectionHeader';

const RecommendedSteps: React.FC = () => {
  return (
    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-4">
      <SectionHeader 
        icon={ListCheck} 
        title="Recommended Next Steps" 
        className="mb-2" 
      />
      <ul className="list-disc list-inside space-y-2 text-slate-700">
        <li>Consider using this report in your next 1:1 with your manager or mentor as a guide for your self-leadership development</li>
        <li>Create a 6 month action plan to address your most critical competency gaps and schedule a time to re-take this assessment to track your progress</li>
        <li>Set an actionable goal for yourself within the next week, and set a reminder to help hold yourself accountable for taking that next step</li>
      </ul>
    </div>
  );
};

export default RecommendedSteps;
