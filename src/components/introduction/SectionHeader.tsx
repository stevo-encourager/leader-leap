import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
  icon?: LucideIcon;
  title: string;
  className?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ icon: Icon, title, className = '' }) => {
  return (
    <div className={`flex items-center gap-3 mb-4 ${className}`}>
      {Icon && (
        <div className="p-3 rounded-full" style={{ backgroundColor: 'white' }}>
          <Icon size={24} strokeWidth={1.5} style={{ color: '#2F564D', stroke: '#2F564D' }} />
        </div>
      )}
      <h2 className="text-2xl font-bold text-encourager">{title}</h2>
    </div>
  );
};

export default SectionHeader;
