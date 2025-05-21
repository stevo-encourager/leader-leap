
import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface InsightSectionProps {
  title: string;
  subtitle: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  className?: string;
}

const InsightSection: React.FC<InsightSectionProps> = ({
  title,
  subtitle,
  isOpen,
  onToggle,
  children,
  className = "mb-4"
}) => {
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={onToggle}
      className={className}
    >
      <CollapsibleTrigger className="flex justify-between items-center w-full text-left">
        <h4 className="text-md font-medium text-encourager">
          {title} <span className="text-slate-600">{subtitle}</span>
        </h4>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 space-y-3">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
};

export default InsightSection;
