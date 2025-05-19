
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Category } from '../utils/assessmentData';
import { BookOpen, Users, User, Clock, Award, Smile } from 'lucide-react';

interface IntroductionPageProps {
  categories: Category[];
  onStartAssessment: () => void;
}

const IntroductionPage: React.FC<IntroductionPageProps> = ({ categories, onStartAssessment }) => {
  return (
    <div className="fade-in space-y-8">
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
          
          <Button 
            size="lg"
            onClick={onStartAssessment}
            className="bg-encourager hover:bg-encourager-light text-white px-8 py-6 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 font-medium"
          >
            Start Your Assessment
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none shadow-card hover:shadow-elevated transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-encourager-accent/20 p-3 rounded-full">
                <BookOpen className="text-encourager" size={24} />
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
                <User className="text-encourager" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-encourager">How It Works</h2>
            </div>
            <p className="text-slate-700 leading-relaxed mb-4">
              For each leadership skill, you will rate:
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="w-3 h-3 rounded-full bg-encourager"></div>
                <div>
                  <strong className="text-encourager">Current ability</strong>
                  <span className="text-slate-600 ml-2">(1-10)</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="w-3 h-3 rounded-full bg-encourager-accent"></div>
                <div>
                  <strong className="text-encourager">Desired level</strong>
                  <span className="text-slate-600 ml-2">(1-10)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Smile, title: 'Self-awareness', desc: 'Gain a clear understanding of your leadership strengths and areas for development' },
          { icon: Award, title: 'Targeted growth', desc: 'Focus your development efforts on skills with the greatest gaps' },
          { icon: Clock, title: 'Progress tracking', desc: 'Establish a baseline to measure your growth over time' },
          { icon: User, title: 'Career advancement', desc: 'Develop the leadership skills required for your next career move' }
        ].map((benefit, idx) => (
          <Card key={idx} className="border-none shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-encourager-accent/20 p-2 rounded-full">
                  <benefit.icon className="text-encourager" size={18} />
                </div>
                <h3 className="font-bold text-encourager">{benefit.title}</h3>
              </div>
              <p className="text-slate-600 text-sm">{benefit.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <CardFooter className="flex justify-center pt-4">
        <Button 
          size="lg"
          onClick={onStartAssessment}
          className="bg-encourager hover:bg-encourager-light text-white px-8 py-6 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 font-medium"
        >
          Start Your Assessment
        </Button>
      </CardFooter>
    </div>
  );
};

export default IntroductionPage;
