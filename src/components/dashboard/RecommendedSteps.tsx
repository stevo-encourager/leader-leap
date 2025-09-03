
import React from 'react';
import { ListCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionHeader from '../introduction/SectionHeader';

const RecommendedSteps: React.FC = () => {
  return (
    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-4">
      <SectionHeader 
        icon={ListCheck} 
        title="Create a 6-month action plan" 
        className="mb-2" 
      />
      <ul className="list-disc list-inside space-y-2 text-slate-700">
        <li>Navigate to <Link to="/profile" className="text-encourager underline hover:underline">My Profile</Link> and create plan to address your most critical competency gaps</li>
        <li>Collaborate with your manager, mentor or coach to develop your leadership development strategy</li>
      </ul>
    </div>
  );
};

export default RecommendedSteps;
