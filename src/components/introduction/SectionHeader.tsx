import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
  icon?: LucideIcon;
  title: string;
  className?: string;
  titleStyle?: React.CSSProperties;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ icon: Icon, title, className = '', titleStyle }) => {
  return (
    <div className={`flex items-center gap-3 mb-6 ${className}`}>
      {Icon && (
        <Icon size={28} strokeWidth={1.5} className="text-encourager-accent-hover" />
      )}
      <h3 className="text-xl md:text-2xl font-normal font-oswald text-black" style={titleStyle}>{title}</h3>
    </div>
  );
};

export default SectionHeader;
