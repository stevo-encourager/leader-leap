
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Category } from '../utils/assessmentData';
import { BookOpen, Users, Presentation, User, Lightbulb, MessageSquare, Scale, Smile, Clock, Award, RefreshCw, Handshake } from 'lucide-react';

interface IntroductionPageProps {
  categories: Category[];
  onStartAssessment: () => void;
}

const IntroductionPage: React.FC<IntroductionPageProps> = ({ categories, onStartAssessment }) => {
  return (
    <div className="fade-in space-y-8">
      <Card className="intro-card">
        <div className="intro-header">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl mb-2">Leadership Assessment</CardTitle>
              <CardDescription className="text-white/90 text-lg max-w-2xl">
                Identify gaps between your current leadership skills and where you want to be.
              </CardDescription>
            </div>
            <div className="hidden md:block">
              <img 
                src="/lovable-uploads/8320d514-fba5-4e1b-a658-1563758db943.png" 
                alt="Encourager Logo" 
                className="h-24 object-contain" 
              />
            </div>
          </div>
        </div>
        <CardContent className="p-8">
          <div className="space-y-8">
            <div className="bg-slate-50 p-6 rounded-lg intro-content-card">
              <h3 className="text-xl font-medium mb-3 flex items-center gap-2">
                <BookOpen className="intro-icon" />
                Purpose of the Assessment
              </h3>
              <p className="text-slate-700">
                This leadership assessment tool is designed to help you identify the gaps between your current 
                leadership abilities and where you aspire to be. By understanding these gaps, you can create 
                focused development plans that target your specific growth areas.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-lg intro-content-card">
              <h3 className="text-xl font-medium mb-3 flex items-center gap-2">
                <Users className="intro-icon" />
                Benefits
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { title: 'Self-awareness', desc: 'Gain a clear understanding of your leadership strengths and areas for development' },
                  { title: 'Targeted development', desc: 'Focus your growth efforts on the skills with the greatest gaps' },
                  { title: 'Progress tracking', desc: 'Establish a baseline to measure your growth over time' },
                  { title: 'Career advancement', desc: 'Develop the leadership skills required for your next career move' }
                ].map((benefit, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-md shadow-sm border border-slate-100">
                    <h4 className="font-semibold text-encourager">{benefit.title}</h4>
                    <p className="text-slate-700 text-sm mt-1">{benefit.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-lg intro-content-card">
              <h3 className="text-xl font-medium mb-3 flex items-center gap-2">
                <Presentation className="intro-icon" />
                Assessment Areas
              </h3>
              <p className="text-slate-700 mb-4">This assessment covers ten key areas of leadership:</p>
              
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { icon: Lightbulb, title: 'Strategic Thinking/Vision', desc: 'The ability to develop a clear vision and identify opportunities for growth and innovation.' },
                  { icon: MessageSquare, title: 'Communication Skills', desc: 'The ability to effectively convey information and ideas to different audiences.' },
                  { icon: Users, title: 'Team Building/Management', desc: 'The ability to build and maintain high-performing teams through effective leadership.' },
                  { icon: Scale, title: 'Decision Making', desc: 'The ability to make timely and effective decisions based on available information.' },
                  { icon: Smile, title: 'Emotional Intelligence', desc: 'The ability to recognize and manage emotions in yourself and others.' },
                  { icon: RefreshCw, title: 'Change Management', desc: 'The ability to effectively lead and support organizational change initiatives.' },
                  { icon: Handshake, title: 'Conflict Resolution', desc: 'The ability to address and resolve disagreements constructively.' },
                  { icon: Users, title: 'Delegation and Empowerment', desc: 'The ability to effectively assign responsibilities and empower team members.' },
                  { icon: Clock, title: 'Time/Priority Management', desc: 'The ability to manage time effectively and prioritize tasks appropriately.' },
                  { icon: Award, title: 'Professional Development', desc: 'The ability to continuously improve skills and knowledge for career growth.' }
                ].map((area, idx) => (
                  <div className="border rounded-md p-4 bg-white shadow-sm hover:shadow-md transition-shadow" key={idx}>
                    <div className="flex items-center gap-3 mb-2">
                      <area.icon className="text-encourager-gold" size={20} />
                      <h4 className="font-medium">{area.title}</h4>
                    </div>
                    <p className="text-sm text-slate-600">{area.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-lg intro-content-card">
              <h3 className="text-xl font-medium mb-3 flex items-center gap-2">
                <User className="intro-icon" />
                How to Complete the Assessment
              </h3>
              <div className="bg-white p-5 rounded-md border border-slate-100 shadow-sm">
                <p className="text-slate-700 mb-2">For each skill, you will rate:</p>
                <div className="pl-5 space-y-2">
                  <p className="flex items-center gap-2">
                    <span className="w-3 h-3 inline-block bg-encourager rounded-full"></span>
                    <strong>Current ability:</strong> Your current proficiency in this skill (1-10)
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-3 h-3 inline-block bg-encourager-gold rounded-full"></span>
                    <strong>Importance to your role:</strong> The level of importance this skill has to your role (1-10)
                  </p>
                </div>
                <p className="mt-3 text-slate-700">The difference between these ratings represents your skill gap and potential development area.</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="px-8 pb-8 pt-0 flex justify-center md:justify-start">
          <Button 
            size="lg" 
            onClick={onStartAssessment}
            className="intro-cta-button"
          >
            Start Your Assessment
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default IntroductionPage;
