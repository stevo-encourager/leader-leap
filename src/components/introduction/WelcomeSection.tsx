import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Quote, Linkedin, Mail } from 'lucide-react';

interface WelcomeSectionProps {
  onStartAssessment?: () => void;
}

const WelcomeSection: React.FC<WelcomeSectionProps> = ({ onStartAssessment }) => {
  return (
    <Card className="border-none overflow-hidden shadow-elevated bg-gradient-to-br from-white to-slate-50">
      <CardContent className="p-8">
        <div className="relative">
          {/* Large quotation mark background */}
          <div className="absolute top-0 right-0 text-encourager opacity-5 hidden md:block">
            <Quote size={120} />
          </div>
          
          <div className="relative z-10">
            {/* Header with photo and intro */}
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 mb-8">
              <div className="w-32 h-32 rounded-full overflow-hidden shadow-lg">
                <img 
                  src="/steve-leadership-coach-welcome-v2.png" 
                  alt="Steve Thompson - Executive Coach" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Hi, I'm Steve
                </h2>
                <p className="text-lg text-slate-600 font-medium">
                  Executive Coach and creator of the Leader Leap Assessment
                </p>
              </div>
            </div>
            
            {/* Main content */}
            <div className="space-y-6 text-slate-700 leading-relaxed text-base">
              <p className="text-lg">
                I created this assessment to help anyone looking to improve their leadership skills.
              </p>
              
              <p>
                With 10 years of professional coaching experience, including 5½ years as Global People Director for a Google-partnered consultancy, I specialise in empowering leaders through strengths-based coaching combined with positive psychology.
              </p>
              
              <p>
                I hold qualifications in HR management, Executive Coaching, and a PGCert in Coaching for Behavioural Change from Henley Business School, plus certifications as a Gallup Strengths Coach, Predictive Index Practitioner, and TalentPredix Practitioner.
              </p>
              
              {/* Contact section */}
              <div className="pt-4 border-t border-slate-200">
                <p className="text-slate-600 mb-4">
                  Connect with me on{' '}
                  <a 
                    href="https://www.linkedin.com/in/stevebthompson/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-encourager hover:text-encourager/80 font-semibold transition-colors"
                  >
                    LinkedIn
                  </a>{' '}
                  or reach out directly - I'd love to hear about your leadership development journey and partner with you as your coach to turn these results into real transformation.
                </p>
                
                {/* Mobile quotation mark */}
                <div className="text-encourager opacity-5 text-center md:hidden">
                  <Quote size={80} />
                </div>
                
                {onStartAssessment && (
                  <div className="pt-4 flex justify-center">
                    <Button 
                      onClick={onStartAssessment}
                      className="w-full md:w-auto bg-encourager hover:bg-encourager/90 text-white py-3 px-8 text-lg"
                    >
                      Start Your Assessment
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WelcomeSection; 