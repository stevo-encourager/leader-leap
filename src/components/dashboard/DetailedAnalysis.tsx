
import React from 'react';
import { Category } from '@/utils/assessmentTypes';
import SkillGapChart from '../SkillGapChart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart2, HelpCircle, Target, TrendingUp } from 'lucide-react';
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
  // Add extensive validation to ensure we have data to render
  const hasCategories = categories && 
    Array.isArray(categories) && 
    categories.length > 0 && 
    categories.some(cat => 
      cat && cat.skills && 
      Array.isArray(cat.skills) && 
      cat.skills.length > 0
    );
  
  console.log('DetailedAnalysis - Categories:', categories);
  console.log('DetailedAnalysis - hasCategories:', hasCategories);

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="bg-slate-50 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-encourager" />
            <CardTitle className="text-lg font-medium">Competency Analysis</CardTitle>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-slate-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="w-80">
                <p>View your leadership competency data through different visualizations and insights.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription>
          Visualize and analyze your leadership competency gaps and insights
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="radar-chart" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="radar-chart" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Radar Chart
            </TabsTrigger>
            <TabsTrigger value="key-insights" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Key Insights
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="radar-chart" className="mt-0">
            {hasCategories ? (
              <div className="h-[400px] w-full p-4">
                <SkillGapChart categories={categories} />
              </div>
            ) : (
              <div className="h-[400px] w-full flex items-center justify-center bg-slate-50">
                <p className="text-slate-500 text-center">
                  No category data available for visualization. Please complete an assessment first.
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="key-insights" className="mt-0">
            <div className="h-[400px] w-full p-4 flex items-center justify-center bg-slate-50">
              <p className="text-slate-500 text-center">
                Key insights content will be displayed here.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DetailedAnalysis;
