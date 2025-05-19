
import React from 'react';
import { Category } from '../../utils/assessmentTypes';
import SkillGapChart from '../SkillGapChart';

interface DetailedAnalysisProps {
  categories: Category[];
}

const DetailedAnalysis: React.FC<DetailedAnalysisProps> = ({ categories }) => {
  return (
    <div>
      <h3 className="text-lg font-medium mb-3">Detailed Analysis</h3>
      <div className="bg-white rounded-lg p-3 border w-full">
        <div className="w-full h-[500px]">
          <SkillGapChart categories={categories} />
        </div>
      </div>
    </div>
  );
};

export default DetailedAnalysis;
