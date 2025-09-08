
import React from 'react';
import { User } from 'lucide-react';
import SectionHeader from '../introduction/SectionHeader';

const CoachingSupport: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
      {/* Left Card - Coaching Information */}
      <div className="lg:col-span-7 bg-slate-50 rounded-lg border border-slate-200 shadow-sm p-6">
        <SectionHeader 
          icon={User} 
          title="Get some expert coaching support" 
          className="mb-4" 
        />
        
        <ul className="list-disc list-inside space-y-2 text-slate-700 text-left">
          <li>Learn how to lean into your strengths to achieve your goals</li>
          <li>Understand yourself better and eliminate self-limiting beliefs or obstacles that hold you back</li>
          <li>Establish regular touchpoints for tracking growth and gaining insights</li>
        </ul>
        
        <div className="pt-3 border-t border-slate-100 text-left">
          <a 
            href="https://www.encouragercoaching.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-encourager hover:underline text-base block mb-3"
          >
            www.encouragercoaching.com
          </a>
          <a 
            href="https://calendar.app.google/PwZrr2JJXVi1Uwrq7" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-encourager hover:underline text-base hover:scale-105 transition-transform duration-700 inline-block font-bold"
          >
            Book a free 30 minute discovery call
          </a>
        </div>
      </div>
      
      {/* Right Card - Photo */}
      <div className="lg:col-span-3 bg-white rounded-lg border border-slate-200 shadow-sm p-6 flex justify-center items-center">
        <img 
          src="/lovable-uploads/b35e005b-ec23-4976-8796-738f7c856377.png" 
          alt="Steve Thompson - Leadership Coach" 
          className="w-full h-full object-cover rounded-lg shadow-lg"
        />
      </div>
    </div>
  );
};

export default CoachingSupport;
