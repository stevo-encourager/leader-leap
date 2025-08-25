import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';
import SectionHeader from './SectionHeader';

const PurposeSection: React.FC = () => {
  return (
    <Card className="border-none shadow-card hover:shadow-elevated transition-all duration-300" style={{ backgroundColor: '#5fac9a' }}>
      <CardContent className="p-6">
        <SectionHeader title="Purpose of this Assessment" icon={Star} className="[&>h2]:text-white" />
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-2 rounded-lg border border-slate-100 bg-white">
            <Star size={16} style={{ color: '#2F564D' }} />
            <div className="text-sm" style={{ color: '#2F564D' }}>
              Gain Self-awareness
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg border border-slate-100 bg-white">
            <Star size={16} style={{ color: '#2F564D' }} />
            <div className="text-sm" style={{ color: '#2F564D' }}>
              Build a targeted growth plan
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg border border-slate-100 bg-white">
            <Star size={16} style={{ color: '#2F564D' }} />
            <div className="text-sm" style={{ color: '#2F564D' }}>
              Track your progress
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg border border-slate-100 bg-white">
            <Star size={16} style={{ color: '#2F564D' }} />
            <div className="text-sm" style={{ color: '#2F564D' }}>
              Career advancement
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PurposeSection;

