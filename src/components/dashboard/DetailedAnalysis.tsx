
import React from 'react';
import { Category, Demographics } from '@/utils/assessmentTypes';
import SkillGapChart from '../SkillGapChart';
import AIInsights from './AIInsights';
import SkillsAssessment from './SkillsAssessment';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart2, HelpCircle, Target, TrendingUp, ListChecks } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';

interface DetailedAnalysisProps {
  categories: Category[];
  demographics?: Demographics;
  averageGap?: number;
  assessmentId?: string;
  className?: string;
}

const DetailedAnalysis: React.FC<DetailedAnalysisProps> = ({ 
  categories, 
  demographics = {},
  averageGap = 0,
  assessmentId,
  className = '' 
}) => {
  const isMobile = useIsMobile();
  


  // Add extensive validation to ensure we have data to render
  const hasCategories = categories && 
    Array.isArray(categories) && 
    categories.length > 0 && 
    categories.some(cat => 
      cat && cat.skills && 
      Array.isArray(cat.skills) && 
      cat.skills.length > 0
    );
  


  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="bg-slate-50 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-encourager-accent/20 p-3 rounded-full">
              <BarChart2 className="text-encourager" size={24} strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: '#3a6859' }}>Competency Analysis</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Visualise and analyse your leadership competency gaps and insights
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
          <TabsList
            className={`w-full rounded-lg overflow-hidden ${
              isMobile 
                ? 'flex flex-col space-y-1 p-2 h-auto' 
                : 'grid grid-cols-3'
            }`}
            style={{ background: '#30574E' }}
          >
            <TabsTrigger
              value="radar-chart"
              className={`flex items-center gap-2 text-white data-[state=active]:bg-[#91ABA5] data-[state=active]:text-white data-[state=active]:shadow-none ${
                isMobile ? 'justify-start text-left w-full py-3' : ''
              }`}
            >
              <Target className="h-4 w-4 text-white" />
              {isMobile ? 'Chart' : 'Radar Chart'}
            </TabsTrigger>
            <TabsTrigger
              value="key-insights"
              className={`flex items-center gap-2 text-white data-[state=active]:bg-[#91ABA5] data-[state=active]:text-white data-[state=active]:shadow-none ${
                isMobile ? 'justify-start text-left w-full py-3' : ''
              }`}
            >
              <TrendingUp className="h-4 w-4 text-white" />
              {isMobile ? 'Insights' : 'Key Insights & Recommendations'}
            </TabsTrigger>
            <TabsTrigger
              value="skills-assessment"
              className={`flex items-center gap-2 text-white data-[state=active]:bg-[#91ABA5] data-[state=active]:text-white data-[state=active]:shadow-none ${
                isMobile ? 'justify-start text-left w-full py-3' : ''
              }`}
            >
              <ListChecks className="h-4 w-4 text-white" />
              {isMobile ? 'Skills' : 'Skills Assessment'}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="radar-chart" className="mt-0">
            {hasCategories ? (
              <div className={`w-full p-6 ${isMobile ? 'h-[400px]' : 'h-[600px]'}`}>
                <SkillGapChart categories={categories} />
              </div>
            ) : (
              <div className={`w-full flex items-center justify-center bg-slate-50 ${isMobile ? 'h-[400px]' : 'h-[600px]'}`}>
                <p className="text-slate-500 text-center">
                  No category data available for visualization. Please complete an assessment first.
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="key-insights" className="mt-0">
            {hasCategories ? (
              <div className={`w-full p-6 overflow-y-auto ${isMobile ? 'h-[400px]' : 'h-[600px]'}`}>
                <AIInsights 
                  categories={categories}
                  demographics={demographics}
                  averageGap={averageGap}
                  assessmentId={assessmentId}
                />
              </div>
            ) : (
              <div className={`w-full flex items-center justify-center bg-slate-50 ${isMobile ? 'h-[400px]' : 'h-[600px]'}`}>
                <p className="text-slate-500 text-center">
                  No assessment data available for AI insights. Please complete an assessment first.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="skills-assessment" className="mt-0 skills-assessment-tab" data-tab="skills-assessment">
            {hasCategories ? (
              <div className={`w-full p-6 overflow-y-auto ${isMobile ? 'h-[400px]' : 'h-[600px]'}`}>
                <SkillsAssessment categories={categories} />
              </div>
            ) : (
              <div className={`w-full flex items-center justify-center bg-slate-50 ${isMobile ? 'h-[400px]' : 'h-[600px]'}`}>
                <p className="text-slate-500 text-center">
                  No assessment data available for skills assessment. Please complete an assessment first.
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
