
import React from 'react';

interface InsightSummaryProps {
  averageGap: string | number;
}

const InsightSummary: React.FC<InsightSummaryProps> = ({ averageGap }) => {
  return (
    <div className="bg-primary/5 p-4 rounded-lg mb-4">
      <p className="text-sm">
        Based on your assessment, your average competency gap is <span className="font-bold">{averageGap}</span> points.
        This indicates the typical difference between your current abilities and how important these competencies are to your role.
      </p>
    </div>
  );
};

export default InsightSummary;
