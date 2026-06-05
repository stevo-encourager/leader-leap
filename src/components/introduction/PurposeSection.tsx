import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Check } from 'lucide-react';
import SectionHeader from './SectionHeader';

const PurposeSection: React.FC = () => {
  return (
    <Card className="border-none shadow-card hover:shadow-elevated transition-all duration-300 bg-encourager">
      <CardContent className="p-6">
        <SectionHeader title="PURPOSE" icon={Star} titleStyle={{ color: 'white' }} />
        <div className="space-y-3 pl-2">
          <div className="flex items-center gap-3">
            <Check size={20} className="text-encourager-accent-hover flex-shrink-0" />
            <div className="text-white">
              <span className="font-bold">Gain self-awareness</span> of your leadership strengths
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Check size={20} className="text-encourager-accent-hover flex-shrink-0" />
            <div className="text-white">
              <span className="font-bold">Build a targeted</span> development plan
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Check size={20} className="text-encourager-accent-hover flex-shrink-0" />
            <div className="text-white">
              <span className="font-bold">Track your progress</span> over time
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Check size={20} className="text-encourager-accent-hover flex-shrink-0" />
            <div className="text-white">
              <span className="font-bold">Future-proof</span> your career in the age of AI
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PurposeSection;

