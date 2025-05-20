
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

const PurposeSection: React.FC = () => {
  return (
    <Card className="border-none shadow-card hover:shadow-elevated transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-encourager-accent/20 p-3 rounded-full">
            <BookOpen className="text-encourager" size={24} strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-bold text-encourager">Purpose</h2>
        </div>
        <p className="text-slate-700 leading-relaxed">
          This leadership assessment tool is designed to help you identify the gaps between current 
          leadership competencies (10 in total) and where you aspire to be. By understanding these gaps, 
          you can create focused development plans that target your specific growth areas.
        </p>
      </CardContent>
    </Card>
  );
};

export default PurposeSection;
