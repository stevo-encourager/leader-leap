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
    <div className={`flex items-center gap-3 mb-4 ${className}`}>
      {Icon && (
        <div className="p-3 rounded-full" style={{ backgroundColor: 'white' }}>
          <Icon size={24} strokeWidth={1.5} className="text-slate-600" style={{ stroke: '#475569' }} />
        </div>
      )}
      <h2 className="text-2xl font-bold text-encourager" style={titleStyle}>{title}</h2>
    </div>
  );
};

export default SectionHeader;
