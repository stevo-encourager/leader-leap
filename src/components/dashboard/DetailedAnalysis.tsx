
import React from 'react';
import { Category, Demographics } from '@/utils/assessmentTypes';
import SkillGapChart from '../SkillGapChart';
import AIInsights from './AIInsights';
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
  demographics?: Demographics;
  averageGap?: number;
  className?: string;
}

const DetailedAnalysis: React.FC<DetailedAnalysisProps> = ({ 
  categories, 
  demographics = {},
  averageGap = 0,
  className = '' 
}) => {
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
          <div className="flex items-center gap-3">
            <div className="bg-encourager-accent/20 p-3 rounded-full">
              <BarChart2 className="text-encourager" size={24} strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-encourager">Competency Analysis</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Visualize and analyze your leadership competency gaps and insights
              </p>
            </div>
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
              <div className="h-[600px] w-full p-6">
                <SkillGapChart categories={categories} />
              </div>
            ) : (
              <div className="h-[600px] w-full flex items-center justify-center bg-slate-50">
                <p className="text-slate-500 text-center">
                  No category data available for visualization. Please complete an assessment first.
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="key-insights" className="mt-0">
            {hasCategories ? (
              <div className="h-[600px] w-full p-6 overflow-y-auto">
                <AIInsights 
                  categories={categories}
                  demographics={demographics}
                  averageGap={averageGap}
                />
              </div>
            ) : (
              <div className="h-[600px] w-full flex items-center justify-center bg-slate-50">
                <p className="text-slate-500 text-center">
                  No assessment data available for AI insights. Please complete an assessment first.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DetailedAnalysis;
