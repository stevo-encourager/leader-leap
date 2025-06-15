import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';
import SectionHeader from './SectionHeader';

const PurposeSection: React.FC = () => {
  return (
    <Card className="border-none shadow-card hover:shadow-elevated transition-all duration-300">
      <CardContent className="p-6">
        <SectionHeader icon={Star} title="Purpose" />
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-encourager">
              <Star size={16} />
            </div>
            <div className="text-slate-700 text-sm">
              Self-awareness
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-encourager">
              <Star size={16} />
            </div>
            <div className="text-slate-700 text-sm">
              Targeted growth
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-encourager">
              <Star size={16} />
            </div>
            <div className="text-slate-700 text-sm">
              Progress tracking
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-encourager">
              <Star size={16} />
            </div>
            <div className="text-slate-700 text-sm">
              Career advancement
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PurposeSection;
