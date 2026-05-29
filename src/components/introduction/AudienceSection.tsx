import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { User, Check } from 'lucide-react';
import SectionHeader from './SectionHeader';

const AudienceSection: React.FC = () => {
  return (
    <Card className="border-none shadow-card hover:shadow-elevated transition-all duration-300 bg-encourager">
      <CardContent className="p-6">
        <SectionHeader icon={User} title="IDEAL FOR" titleStyle={{ color: 'white' }} />
        <div className="space-y-3 pl-2">
          <div className="flex items-center gap-3">
            <Check size={20} className="text-encourager-accent-hover flex-shrink-0" />
            <div className="text-white">
              <span className="font-bold">Aspiring Leaders</span> stepping into leadership
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Check size={20} className="text-encourager-accent-hover flex-shrink-0" />
            <div className="text-white">
              <span className="font-bold">Mid-Career Executives</span> preparing for senior roles
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Check size={20} className="text-encourager-accent-hover flex-shrink-0" />
            <div className="text-white">
              <span className="font-bold">C-Suite Leaders</span> staying ahead of change
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Check size={20} className="text-encourager-accent-hover flex-shrink-0" />
            <div className="text-white">
              <span className="font-bold">Entrepreneurs</span> scaling their impact
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AudienceSection;
