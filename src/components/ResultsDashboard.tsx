
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Category, Skill } from '@/utils/assessmentData';
import SkillGapChart from './SkillGapChart';

interface ResultsDashboardProps {
  categories: Category[];
  onRestart: () => void;
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  categories,
  onRestart
}) => {
  // Calculate overall scores and gaps
  const calculateOverallScore = (type: 'current' | 'desired'): number => {
    let totalScore = 0;
    let totalSkills = 0;
    
    categories.forEach(category => {
      category.skills.forEach(skill => {
        totalScore += skill.ratings[type];
        totalSkills++;
      });
    });
    
    return totalSkills > 0 ? Math.round((totalScore / totalSkills) * 10) / 10 : 0;
  };
  
  const currentOverall = calculateOverallScore('current');
  const desiredOverall = calculateOverallScore('desired');
  const overallGap = Math.round((desiredOverall - currentOverall) * 10) / 10;
  
  // Find biggest gaps
  const findBiggestGaps = (): Array<{skill: Skill, gap: number, category: string}> => {
    const allSkillsWithGaps: Array<{skill: Skill, gap: number, category: string}> = [];
    
    categories.forEach(category => {
      category.skills.forEach(skill => {
        const gap = skill.ratings.desired - skill.ratings.current;
        if (gap > 0) {
          allSkillsWithGaps.push({
            skill,
            gap,
            category: category.title
          });
        }
      });
    });
    
    return allSkillsWithGaps
      .sort((a, b) => b.gap - a.gap)
      .slice(0, 5);
  };
  
  const biggestGaps = findBiggestGaps();

  // Handle export to PDF
  const handleExport = () => {
    // This would typically integrate with a PDF generation library
    alert('Export functionality would create a PDF report of your assessment results');
  };

  return (
    <div className="fade-in">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Leadership Assessment Results</CardTitle>
          <CardDescription>
            Your leadership skill gaps and development opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-sm text-muted-foreground">Current Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{currentOverall} <span className="text-sm font-normal text-muted-foreground">/ 10</span></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-sm text-muted-foreground">Desired Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{desiredOverall} <span className="text-sm font-normal text-muted-foreground">/ 10</span></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-sm text-muted-foreground">Overall Gap</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${overallGap > 0 ? 'text-secondary' : 'text-green-500'}`}>
                  {overallGap > 0 ? '+' : ''}{overallGap}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="overview" className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="development">Development Areas</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-4">
              <SkillGapChart categories={categories} />
            </TabsContent>
            <TabsContent value="development" className="mt-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Top Development Opportunities</h3>
                {biggestGaps.length > 0 ? (
                  <div className="divide-y">
                    {biggestGaps.map((item, index) => (
                      <div key={index} className="py-3">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium">{item.skill.name}</p>
                            <p className="text-sm text-muted-foreground">{item.category}</p>
                          </div>
                          <div className="text-secondary font-medium">+{item.gap} gap</div>
                        </div>
                        <div className="mt-2 skill-rating">
                          <div 
                            className="skill-gap"
                            style={{ 
                              width: `${item.skill.ratings.current * 10}%`,
                              backgroundColor: 'rgba(36, 99, 235, 0.2)'
                            }}
                          ></div>
                          <div 
                            className="absolute top-0 h-full border-r-2 border-secondary"
                            style={{ left: `${item.skill.ratings.desired * 10}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No significant gaps found.</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onRestart}>
            Start New Assessment
          </Button>
          <Button onClick={handleExport}>
            Export Results
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResultsDashboard;
