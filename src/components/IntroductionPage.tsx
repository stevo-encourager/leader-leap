
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Category } from '../utils/assessmentData';
import { BookOpen, Users, Presentation, User, Lightbulb, MessageSquare, Decision, Smile, Clock, Award } from 'lucide-react';

interface IntroductionPageProps {
  categories: Category[];
  onStartAssessment: () => void;
}

const IntroductionPage: React.FC<IntroductionPageProps> = ({ categories, onStartAssessment }) => {
  return (
    <div className="fade-in space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Welcome to the Leadership Assessment</CardTitle>
          <CardDescription>
            This assessment will help you identify gaps between your current leadership skills and where you want to be.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="bg-slate-50 p-6 rounded-lg">
              <h3 className="text-xl font-medium mb-3 flex items-center gap-2">
                <BookOpen className="text-primary" />
                Purpose of the Assessment
              </h3>
              <p className="text-slate-700">
                This leadership assessment tool is designed to help you identify the gaps between your current 
                leadership abilities and where you aspire to be. By understanding these gaps, you can create 
                focused development plans that target your specific growth areas.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-lg">
              <h3 className="text-xl font-medium mb-3 flex items-center gap-2">
                <Users className="text-primary" />
                Benefits
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li><strong>Self-awareness</strong> - Gain a clear understanding of your leadership strengths and areas for development</li>
                <li><strong>Targeted development</strong> - Focus your growth efforts on the skills with the greatest gaps</li>
                <li><strong>Progress tracking</strong> - Establish a baseline to measure your growth over time</li>
                <li><strong>Career advancement</strong> - Develop the leadership skills required for your next career move</li>
              </ul>
            </div>

            <div className="bg-slate-50 p-6 rounded-lg">
              <h3 className="text-xl font-medium mb-3 flex items-center gap-2">
                <Presentation className="text-primary" />
                Assessment Areas
              </h3>
              <p className="text-slate-700 mb-4">This assessment covers ten key areas of leadership:</p>
              
              <div className="space-y-4">
                <div className="border rounded-md p-4 bg-white">
                  <div className="flex items-center gap-3 mb-2">
                    <Lightbulb className="text-primary" size={20} />
                    <h4 className="font-medium">Strategic Thinking/Vision</h4>
                  </div>
                  <p className="text-sm text-slate-600">The ability to develop a clear vision and identify opportunities for growth and innovation.</p>
                </div>
                
                <div className="border rounded-md p-4 bg-white">
                  <div className="flex items-center gap-3 mb-2">
                    <MessageSquare className="text-primary" size={20} />
                    <h4 className="font-medium">Communication Skills</h4>
                  </div>
                  <p className="text-sm text-slate-600">The ability to effectively convey information and ideas to different audiences.</p>
                </div>
                
                <div className="border rounded-md p-4 bg-white">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="text-primary" size={20} />
                    <h4 className="font-medium">Team Building/Management</h4>
                  </div>
                  <p className="text-sm text-slate-600">The ability to build and maintain high-performing teams through effective leadership.</p>
                </div>
                
                <div className="border rounded-md p-4 bg-white">
                  <div className="flex items-center gap-3 mb-2">
                    <Decision className="text-primary" size={20} />
                    <h4 className="font-medium">Decision Making</h4>
                  </div>
                  <p className="text-sm text-slate-600">The ability to make timely and effective decisions based on available information.</p>
                </div>
                
                <div className="border rounded-md p-4 bg-white">
                  <div className="flex items-center gap-3 mb-2">
                    <Smile className="text-primary" size={20} />
                    <h4 className="font-medium">Emotional Intelligence</h4>
                  </div>
                  <p className="text-sm text-slate-600">The ability to recognize and manage emotions in yourself and others.</p>
                </div>
                
                <div className="border rounded-md p-4 bg-white">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="text-primary" size={20} /> {/* Using Users icon for Change Management as there's no direct Change icon */}
                    <h4 className="font-medium">Change Management</h4>
                  </div>
                  <p className="text-sm text-slate-600">The ability to effectively lead and support organizational change initiatives.</p>
                </div>
                
                <div className="border rounded-md p-4 bg-white">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="text-primary" size={20} /> {/* Using Users icon for Conflict Resolution as there's no direct Conflict icon */}
                    <h4 className="font-medium">Conflict Resolution</h4>
                  </div>
                  <p className="text-sm text-slate-600">The ability to address and resolve disagreements constructively.</p>
                </div>
                
                <div className="border rounded-md p-4 bg-white">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="text-primary" size={20} /> {/* Using Users icon for Delegation/Empowerment as there's no direct Handshake icon */}
                    <h4 className="font-medium">Delegation and Empowerment</h4>
                  </div>
                  <p className="text-sm text-slate-600">The ability to effectively assign responsibilities and empower team members.</p>
                </div>
                
                <div className="border rounded-md p-4 bg-white">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="text-primary" size={20} />
                    <h4 className="font-medium">Time/Priority Management</h4>
                  </div>
                  <p className="text-sm text-slate-600">The ability to manage time effectively and prioritize tasks appropriately.</p>
                </div>
                
                <div className="border rounded-md p-4 bg-white">
                  <div className="flex items-center gap-3 mb-2">
                    <Award className="text-primary" size={20} />
                    <h4 className="font-medium">Professional Development</h4>
                  </div>
                  <p className="text-sm text-slate-600">The ability to continuously improve skills and knowledge for career growth.</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-lg">
              <h3 className="text-xl font-medium mb-3 flex items-center gap-2">
                <User className="text-primary" />
                How to Complete the Assessment
              </h3>
              <p className="text-slate-700 mb-2">For each skill, you will rate:</p>
              <div className="pl-5 space-y-2">
                <p><strong>Current ability:</strong> Your current proficiency in this skill (1-10)</p>
                <p><strong>Importance to your role:</strong> The level of importance this skill has to your role (1-10)</p>
              </div>
              <p className="mt-3 text-slate-700">The difference between these ratings represents your skill gap and potential development area.</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button size="lg" onClick={onStartAssessment}>
            Start Assessment
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default IntroductionPage;
