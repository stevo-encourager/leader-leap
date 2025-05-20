
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { User, Star } from 'lucide-react';

const AudienceSection: React.FC = () => {
  return (
    <Card className="border-none shadow-card hover:shadow-elevated transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-encourager-accent/20 p-3 rounded-full">
            <User className="text-encourager" size={24} strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-bold text-encourager">Who is this for?</h2>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-encourager">
              <Star size={16} />
            </div>
            <div className="text-slate-700 text-sm">
              Aspiring Leaders
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-encourager">
              <Star size={16} />
            </div>
            <div className="text-slate-700 text-sm">
              Mid-Career Execs
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-encourager">
              <Star size={16} />
            </div>
            <div className="text-slate-700 text-sm">
              C-Suite
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-encourager">
              <Star size={16} />
            </div>
            <div className="text-slate-700 text-sm">
              Entrepreneurs & Business Owners
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AudienceSection;
