
import React from 'react';
import { User } from 'lucide-react';
import SectionHeader from '../introduction/SectionHeader';

const CoachingSupport: React.FC = () => {
  return (
    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 h-full text-center">
      <SectionHeader 
        icon={User} 
        title="Get some expert coaching support" 
        className="mb-2" 
      />
      
      <ul className="list-disc list-inside space-y-2 text-slate-700 text-center">
        <li>Learn how to lean into your strengths to achieve your goals</li>
        <li>Understand yourself better and eliminate self-limiting beliefs or obstacles that hold you back</li>
        <li>Establish accountability for practice and reflection</li>
      </ul>
      
      <div className="mt-4 pt-3 border-t border-slate-100 text-center">
        <a 
          href="https://www.encouragercoaching.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-encourager hover:underline text-sm block mb-2 font-bold"
        >
          www.encouragercoaching.com
        </a>
        <a 
          href="https://calendar.app.google/PwZrr2JJXVi1Uwrq7" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-encourager hover:underline text-sm hover:scale-102 transition-transform duration-500 inline-block"
        >
          Book a free 30 minute discovery call
        </a>
      </div>
    </div>
  );
};

export default CoachingSupport;
