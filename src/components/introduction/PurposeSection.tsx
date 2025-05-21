
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';
import SectionHeader from './SectionHeader';

const PurposeSection: React.FC = () => {
  return (
    <Card className="border-none shadow-card hover:shadow-elevated transition-all duration-300">
      <CardContent className="p-6">
        <SectionHeader icon={BookOpen} title="Purpose" />
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
