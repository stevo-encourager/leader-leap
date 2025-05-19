
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Category } from '../utils/assessmentData';
import { BookOpen, Users, User, Clock, Award, Smile } from 'lucide-react';

interface IntroductionPageProps {
  categories: Category[];
  onStartAssessment: () => void;
}

const IntroductionPage: React.FC<IntroductionPageProps> = ({ categories, onStartAssessment }) => {
  return (
    <div className="fade-in space-y-8">
      <Card className="border-none overflow-hidden shadow-elevated bg-gradient-to-br from-white to-slate-50">
        <CardHeader className="p-8 pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <img 
                  src="/lovable-uploads/8320d514-fba5-4e1b-a658-1563758db943.png" 
                  alt="Encourager Logo" 
                  className="h-12 md:h-16 object-contain" 
                />
                <CardTitle className="text-3xl md:text-4xl font-bold text-encourager">Leadership Assessment</CardTitle>
              </div>
              <CardDescription className="text-lg text-slate-600 max-w-2xl">
                Identify gaps between your current leadership skills and where you want to be.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8 pt-2 space-y-8">
          <div className="bg-white rounded-xl overflow-hidden shadow-card border border-slate-100">
            <div className="bg-encourager p-6 text-white">
              <h3 className="text-xl font-medium flex items-center gap-2">
                <BookOpen className="text-encourager-accent" size={22} />
                Purpose of the Assessment
              </h3>
            </div>
            <div className="p-6">
              <p className="text-slate-700 leading-relaxed">
                This leadership assessment tool is designed to help you identify the gaps between your current 
                leadership abilities and where you aspire to be. By understanding these gaps, you can create 
                focused development plans that target your specific growth areas.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl overflow-hidden shadow-card border border-slate-100">
            <div className="bg-encourager p-6 text-white">
              <h3 className="text-xl font-medium flex items-center gap-2">
                <Users className="text-encourager-accent" size={22} />
                Benefits
              </h3>
            </div>
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { icon: Smile, title: 'Self-awareness', desc: 'Gain a clear understanding of your leadership strengths and areas for development' },
                  { icon: Award, title: 'Targeted development', desc: 'Focus your growth efforts on the skills with the greatest gaps' },
                  { icon: Clock, title: 'Progress tracking', desc: 'Establish a baseline to measure your growth over time' },
                  { icon: User, title: 'Career advancement', desc: 'Develop the leadership skills required for your next career move' }
                ].map((benefit, idx) => (
                  <div key={idx} className="bg-slate-50 p-5 rounded-lg shadow-sm border border-slate-100 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-encourager-accent/20 p-2 rounded-full">
                        <benefit.icon className="text-encourager" size={20} />
                      </div>
                      <h4 className="font-bold text-encourager">{benefit.title}</h4>
                    </div>
                    <p className="text-slate-600">{benefit.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl overflow-hidden shadow-card border border-slate-100">
            <div className="bg-encourager p-6 text-white">
              <h3 className="text-xl font-medium flex items-center gap-2">
                <User className="text-encourager-accent" size={22} />
                How to Complete the Assessment
              </h3>
            </div>
            <div className="p-6">
              <div className="bg-slate-50 p-6 rounded-lg border border-slate-100 shadow-sm">
                <p className="text-slate-700 mb-4">For each leadership skill, you will rate:</p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-slate-200">
                    <div className="w-4 h-4 rounded-full bg-encourager"></div>
                    <div>
                      <strong className="text-encourager">Current ability:</strong>
                      <p className="text-slate-600 mt-1">Your current proficiency in this skill (1-10)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-slate-200">
                    <div className="w-4 h-4 rounded-full bg-encourager-accent"></div>
                    <div>
                      <strong className="text-encourager">Importance to your role:</strong>
                      <p className="text-slate-600 mt-1">The level of importance this skill has to your role (1-10)</p>
                    </div>
                  </div>
                </div>
                <p className="mt-6 text-slate-700 p-4 bg-encourager/10 rounded-lg border border-encourager/20">
                  The difference between these ratings represents your skill gap and potential development area.
                </p>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="px-8 pb-8 pt-0 flex justify-center">
          <Button 
            size="lg"
            onClick={onStartAssessment}
            className="bg-encourager hover:bg-encourager-light text-white px-8 py-6 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 font-medium"
          >
            Start Your Assessment
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default IntroductionPage;
