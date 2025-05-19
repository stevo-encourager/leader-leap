
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Category, Demographics } from '../utils/assessmentTypes';
import { ArrowLeft, Download } from 'lucide-react';
import ProfileSummary from './dashboard/ProfileSummary';
import DetailedAnalysis from './dashboard/DetailedAnalysis';
import KeyInsights from './dashboard/KeyInsights';
import EncouragerCoaching from './dashboard/EncouragerCoaching';
import html2pdf from 'html2pdf.js';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface ResultsDashboardProps {
  categories: Category[];
  demographics: Demographics;
  onRestart: () => void;
  onBack: () => void;
  onSignup?: () => void;
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ 
  categories, 
  demographics, 
  onRestart, 
  onBack,
  onSignup
}) => {
  const { user } = useAuth();
  
  // Calculate the average gap for all competencies
  const totalSkills = categories.reduce((sum, category) => sum + category.skills.length, 0);
  const totalGap = categories.reduce((sum, category) => {
    return sum + category.skills.reduce((catSum, skill) => {
      return catSum + Math.abs((skill.ratings.desired || 0) - (skill.ratings.current || 0));
    }, 0);
  }, 0);
  
  const averageGap = parseFloat((totalGap / totalSkills).toFixed(2));

  // Find the top 3 skills with the largest gaps
  const allSkills = categories.flatMap(category => 
    category.skills.map(skill => ({
      ...skill,
      categoryTitle: category.title,
      gap: parseFloat(Math.abs((skill.ratings.desired || 0) - (skill.ratings.current || 0)).toFixed(2))
    }))
  );
  
  // Find strengths (highest current ratings)
  const strengths = [...allSkills]
    .sort((a, b) => (b.ratings.current || 0) - (a.ratings.current || 0))
    .slice(0, 3);
    
  // Find lowest scoring competencies
  const lowestSkills = [...allSkills]
    .sort((a, b) => (a.ratings.current || 0) - (b.ratings.current || 0))
    .slice(0, 3);

  // PDF export function
  const handleExportPDF = () => {
    if (!user) {
      toast({
        title: "Sign up required",
        description: "Please sign up to download your results as PDF",
        variant: "destructive",
      });
      
      if (onSignup) {
        onSignup();
      }
      
      return;
    }
    
    const element = document.getElementById('results-content');
    const opt = {
      margin: 10,
      filename: 'leadership-assessment-results.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    toast({
      title: "Generating PDF",
      description: "Your results are being prepared for download...",
    });
    
    // Use setTimeout to allow the toast to render before PDF generation starts
    setTimeout(() => {
      html2pdf().set(opt).from(element).save().then(() => {
        toast({
          title: "Download complete",
          description: "Your leadership assessment results have been saved as PDF",
        });
      });
    }, 500);
  };

  return (
    <div className="fade-in space-y-6">
      <Card>
        <CardHeader className="flex flex-row justify-between items-start">
          <div>
            <CardTitle className="text-2xl">Your Leadership Assessment Results</CardTitle>
            <CardDescription>
              Review your leadership competency gaps and development opportunities
            </CardDescription>
          </div>
          <div className="ml-4">
            <img 
              src="/lovable-uploads/8320d514-fba5-4e1b-a658-1563758db943.png" 
              alt="Leadership Assessment Logo" 
              className="h-16 w-auto" 
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-6" id="results-content">
          {/* Profile Summary */}
          <ProfileSummary demographics={demographics} />

          {/* Detailed Analysis */}
          <DetailedAnalysis categories={categories} />

          {/* Key Insights */}
          <KeyInsights 
            averageGap={averageGap} 
            strengths={strengths} 
            lowestSkills={lowestSkills} 
          />

          {/* Combined Encourager Coaching section (replacing both CoachingSupport and StrengthsBasedApproach) */}
          <EncouragerCoaching />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Assessment
          </Button>
          <div className="flex gap-2">
            <Button 
              variant="encourager" 
              className="flex items-center gap-2"
              onClick={handleExportPDF}
            >
              <Download className="h-4 w-4" />
              {user ? 'Download PDF' : 'Save as PDF'}
            </Button>
            <Button onClick={onRestart}>
              Start New Assessment
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResultsDashboard;
