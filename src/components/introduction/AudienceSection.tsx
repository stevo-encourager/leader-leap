import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { User } from 'lucide-react';
import SectionHeader from './SectionHeader';

const AudienceSection: React.FC = () => {
  return (
    <Card className="border-none shadow-card hover:shadow-elevated transition-all duration-300" style={{ backgroundColor: '#6b867f' }}>
      <CardContent className="p-6">
        <SectionHeader icon={User} title="Who is this for?" className="[&>h2]:text-white" />
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-2 rounded-lg border border-slate-100 bg-white">
            <User size={16} style={{ color: '#000000' }} />
            <div className="text-sm" style={{ color: '#000000' }}>
              Aspiring Leaders
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg border border-slate-100 bg-white">
            <User size={16} style={{ color: '#000000' }} />
            <div className="text-sm" style={{ color: '#000000' }}>
              Mid-Career Execs
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg border border-slate-100 bg-white">
            <User size={16} style={{ color: '#000000' }} />
            <div className="text-sm" style={{ color: '#000000' }}>
              C-Suite
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg border border-slate-100 bg-white">
            <User size={16} style={{ color: '#000000' }} />
            <div className="text-sm" style={{ color: '#000000' }}>
              Entrepreneurs & Business Owners
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AudienceSection;
