
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, CircleCheck } from 'lucide-react';
import SectionHeader from './SectionHeader';

const PurposeSection: React.FC = () => {
  return (
    <Card className="border-none shadow-card hover:shadow-elevated transition-all duration-300">
      <CardContent className="p-6">
        <SectionHeader icon={BookOpen} title="Purpose" />
        <ul className="space-y-2 pl-0 list-none">
          <li className="flex items-start gap-2">
            <CircleCheck className="text-encourager flex-shrink-0 mt-1" size={16} strokeWidth={2} />
            <span className="text-slate-700 leading-relaxed">
              This leadership assessment tool is designed to help you identify the gaps between current 
              leadership competencies (10 in total) and where you aspire to be.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CircleCheck className="text-encourager flex-shrink-0 mt-1" size={16} strokeWidth={2} />
            <span className="text-slate-700 leading-relaxed">
              By understanding these gaps, you can create focused development plans that target your 
              specific growth areas.
            </span>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
};

export default PurposeSection;
