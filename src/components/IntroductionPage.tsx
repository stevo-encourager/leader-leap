
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Category } from '../utils/assessmentData';
import { 
  BookOpen, 
  User, 
  CircleCheck, 
  Clock, 
  Award, 
  Smile, 
  FileBarChart, 
  Target, 
  Lightbulb, 
  ArrowRight, 
  TrendingUp,
  HelpCircle 
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

interface IntroductionPageProps {
  categories: Category[];
  onStartAssessment: () => void;
}

const IntroductionPage: React.FC<IntroductionPageProps> = ({ categories, onStartAssessment }) => {
  return (
    <div className="fade-in space-y-8 pt-6">
      <Card className="border-none overflow-hidden shadow-elevated bg-white">
        <div className="p-8 flex flex-col items-center">
          <img 
            src="/lovable-uploads/8320d514-fba5-4e1b-a658-1563758db943.png" 
            alt="Encourager Logo" 
            className="h-24 object-contain mb-6 animate-float" 
          />
          
          <h1 className="text-4xl md:text-5xl font-bold text-encourager mb-4 text-center">
            Leadership Assessment Tool
          </h1>
          
          <p className="text-xl text-slate-600 max-w-2xl text-center mb-10">
            Identify gaps between your current leadership skills and where you want to be.
          </p>
          
          <div className="relative">
            <HoverCard openDelay={100} closeDelay={200}>
              <HoverCardTrigger asChild>
                <Button 
                  size="lg"
                  onClick={onStartAssessment}
                  className="bg-encourager hover:bg-encourager-light text-white px-8 py-6 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 font-medium"
                >
                  Start Your Assessment
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-80 p-4 bg-white border border-slate-200 shadow-lg rounded-lg">
                <div className="flex gap-2 items-start">
                  <HelpCircle className="text-encourager h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-encourager mb-1">Starting Your Assessment</h4>
                    <p className="text-sm text-slate-600">
                      First, you'll enter some demographic information, then rate your current skill level and desired level for each leadership competency on a scale of 1-10.
                    </p>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none shadow-card hover:shadow-elevated transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-encourager-accent/20 p-3 rounded-full">
                <BookOpen className="text-encourager" size={24} strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-bold text-encourager">Purpose</h2>
            </div>
            <p className="text-slate-700 leading-relaxed">
              This leadership assessment tool is designed to help you identify the gaps between your current 
              leadership abilities and where you aspire to be. By understanding these gaps, you can create 
              focused development plans that target your specific growth areas.
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-card hover:shadow-elevated transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-encourager-accent/20 p-3 rounded-full">
                <User className="text-encourager" size={24} strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-bold text-encourager">How It Works</h2>
            </div>
            <p className="text-slate-700 leading-relaxed mb-4">
              For each leadership skill, you will rate:
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="w-3 h-3 rounded-full bg-encourager-accent"></div>
                <div>
                  <strong className="text-encourager">Current ability</strong>
                  <span className="text-slate-600 ml-2">(1-10)</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="w-3 h-3 rounded-full bg-encourager-accent"></div>
                <div>
                  <strong className="text-encourager">Target level</strong>
                  <span className="text-slate-600 ml-2">(1-10)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions section moved above the benefits section */}
      <Card className="border-none shadow-card bg-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-encourager-accent/20 p-3 rounded-full">
              <CircleCheck className="text-encourager" size={24} strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-bold text-encourager">Instructions</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex gap-4 items-center">
              <div className="bg-encourager-accent/10 p-2 rounded-full flex-shrink-0">
                <ArrowRight className="text-encourager" size={16} strokeWidth={1.5} />
              </div>
              <p className="text-slate-700">
                <span className="font-medium">Be honest:</span> This assessment is for your development, so rate your abilities as they truly are, not how you wish they were.
              </p>
            </div>
            
            <div className="flex gap-4 items-center">
              <div className="bg-encourager-accent/10 p-2 rounded-full flex-shrink-0">
                <ArrowRight className="text-encourager" size={16} strokeWidth={1.5} />
              </div>
              <p className="text-slate-700">
                <span className="font-medium">Consider context:</span> When rating "target level," think about what's truly important for your current role or your next step (i.e. a specific role or promotion you are aiming for).
              </p>
            </div>
            
            <div className="flex gap-4 items-center">
              <div className="bg-encourager-accent/10 p-2 rounded-full flex-shrink-0">
                <ArrowRight className="text-encourager" size={16} strokeWidth={1.5} />
              </div>
              <p className="text-slate-700">
                <span className="font-medium">Take your time:</span> Reflect on each skill carefully. The assessment takes approximately 10-15 minutes to complete.
              </p>
            </div>
            
            <div className="flex gap-4 items-center">
              <div className="bg-encourager-accent/10 p-2 rounded-full flex-shrink-0">
                <ArrowRight className="text-encourager" size={16} strokeWidth={1.5} />
              </div>
              <p className="text-slate-700">
                <span className="font-medium">Focus on development:</span> Remember that the goal is to identify areas for growth, not to achieve a perfect score.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Added header for benefits section */}
      <h2 className="text-2xl font-bold text-encourager mt-8 mb-4">What to Use This Assessment For</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Smile, title: 'Self-awareness', desc: 'Gain a clear understanding of your leadership strengths and areas for development' },
          { icon: Target, title: 'Targeted growth', desc: 'Focus your development efforts on skills with the greatest gaps' },
          { icon: FileBarChart, title: 'Progress tracking', desc: 'Establish a baseline to measure your growth over time' },
          { icon: Lightbulb, title: 'Career advancement', desc: 'Develop the leadership skills required for your next career move' }
        ].map((benefit, idx) => (
          <Card key={idx} className="border-none shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-encourager-accent/20 p-2 rounded-full">
                  <benefit.icon className="text-encourager" size={18} strokeWidth={1.5} />
                </div>
                <h3 className="font-bold text-encourager">{benefit.title}</h3>
              </div>
              <p className="text-slate-600 text-sm">{benefit.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <CardFooter className="flex justify-center pt-4 pb-8">
        <div className="relative">
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button 
                size="lg"
                onClick={onStartAssessment}
                className="bg-encourager hover:bg-encourager-light text-white px-8 py-6 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 font-medium"
              >
                Start Your Assessment
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 p-4 bg-white border border-slate-200 shadow-lg rounded-lg">
              <div className="flex gap-2 items-start">
                <HelpCircle className="text-encourager h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-encourager mb-1">Starting Your Assessment</h4>
                  <p className="text-sm text-slate-600">
                    First, you'll enter some demographic information, then rate your current skill level and desired level for each leadership competency on a scale of 1-10.
                  </p>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </CardFooter>
    </div>
  );
};

export default IntroductionPage;
