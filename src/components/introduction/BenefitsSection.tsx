
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Smile, Target, FileBarChart, Lightbulb } from 'lucide-react';

interface BenefitCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

const BenefitCard: React.FC<BenefitCardProps> = ({ icon: Icon, title, description }) => {
  return (
    <Card className="border-none shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
      <CardContent className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-encourager-accent/20 p-2 rounded-full">
            <Icon className="text-encourager" size={18} strokeWidth={1.5} />
          </div>
          <h3 className="font-bold text-encourager">{title}</h3>
        </div>
        <p className="text-slate-600 text-sm">{description}</p>
      </CardContent>
    </Card>
  );
};

const BenefitsSection: React.FC = () => {
  const benefits = [
    { 
      icon: Smile, 
      title: 'Self-awareness', 
      desc: 'Gain a clear understanding of your existing leadership competencies and your areas for development' 
    },
    { 
      icon: Target, 
      title: 'Targeted growth', 
      desc: 'Focus your development efforts on competencies with the greatest gaps' 
    },
    { 
      icon: FileBarChart, 
      title: 'Progress tracking', 
      desc: 'Establish a baseline to measure your growth over time' 
    },
    { 
      icon: Lightbulb, 
      title: 'Career advancement', 
      desc: 'Develop the leadership competencies required for your next career move' 
    }
  ];

  return (
    <>
      <h2 className="text-2xl font-bold text-encourager mt-8 mb-4">What to Use This Assessment For</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {benefits.map((benefit, idx) => (
          <BenefitCard 
            key={idx} 
            icon={benefit.icon} 
            title={benefit.title} 
            description={benefit.desc} 
          />
        ))}
      </div>
    </>
  );
};

export default BenefitsSection;
