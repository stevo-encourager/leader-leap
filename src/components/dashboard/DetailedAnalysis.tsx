
import React from 'react';
import { Category } from '@/utils/assessmentTypes';
import SkillGapChart from '../SkillGapChart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart2, HelpCircle } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from '@/components/ui/tooltip';

interface DetailedAnalysisProps {
  categories: Category[];
  className?: string;
}

const DetailedAnalysis: React.FC<DetailedAnalysisProps> = ({ categories, className = '' }) => {
  // Add validation to ensure we have data to render
  const hasCategories = categories && Array.isArray(categories) && categories.length > 0;

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="bg-slate-50 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-encourager" />
            <CardTitle className="text-lg font-medium">Competency Gap Analysis</CardTitle>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-slate-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="w-80">
                <p>This chart displays the average rating for each competency category, comparing your current abilities with your desired level.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription>
          Visualizes the gap between your current and desired competency levels across leadership categories
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {hasCategories ? (
          <div className="h-[400px] w-full p-4">
            <SkillGapChart categories={categories} />
          </div>
        ) : (
          <div className="h-[400px] w-full flex items-center justify-center bg-slate-50">
            <p className="text-slate-500 text-center">
              No category data available for visualization
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DetailedAnalysis;
