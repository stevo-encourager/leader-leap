
import React from 'react';
import { User } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const CoachingSupport: React.FC = () => {
  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 h-full">
      <div>
        <h3 className="text-lg font-medium mb-2">Consider Coaching</h3>
        
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-12 w-12 rounded-full border border-slate-200">
            <AvatarImage src="/lovable-uploads/8320d514-fba5-4e1b-a658-1563758db943.png" alt="User" />
            <AvatarFallback><User className="h-6 w-6" /></AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-slate-700">Leadership Coach</span>
        </div>
        
        <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
          <li>Learn how to lean into your strengths to achieve your goals</li>
          <li>Understand yourself better and eliminate self-limiting beliefs or obstacles that hold you back</li>
          <li>Establish accountability for practice and reflection</li>
        </ul>
        
        <div className="mt-4 pt-3 border-t border-slate-100">
          <a 
            href="https://www.encouragercoaching.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-encourager hover:underline text-sm block mb-2"
          >
            www.encouragercoaching.com
          </a>
          <a 
            href="https://calendar.app.google/PwZrr2JJXVi1Uwrq7" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-encourager hover:underline text-sm"
          >
            Book a free 30 minute discovery call
          </a>
        </div>
      </div>
    </div>
  );
};

export default CoachingSupport;
