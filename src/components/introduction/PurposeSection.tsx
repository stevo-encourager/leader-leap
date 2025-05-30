
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, CircleDot } from 'lucide-react';
import SectionHeader from './SectionHeader';

const PurposeSection: React.FC = () => {
  return (
    <Card className="border-none shadow-card hover:shadow-elevated transition-all duration-300">
      <CardContent className="p-6">
        <SectionHeader icon={BookOpen} title="Purpose" />
        <ul className="space-y-2 pl-0 list-none">
          <li className="flex items-start gap-2">
            <CircleDot className="text-encourager flex-shrink-0 mt-1" size={16} strokeWidth={2} />
            <span className="text-slate-700 leading-relaxed">
              The Leader Leap tool gives you a clear picture of your leadership capabilities today 
              and charts your target growth path across 10 core competencies.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CircleDot className="text-encourager flex-shrink-0 mt-1" size={16} strokeWidth={2} />
            <span className="text-slate-700 leading-relaxed">
              These insights, enhanced by AI-powered recommendations, help you to create a focused 
              development plan to bridge the gaps and achieve your goals.
            </span>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
};

export default PurposeSection;
