
import React from 'react';

interface NoticaTextProps {
  children: React.ReactNode;
  className?: string;
}

const NoticaText: React.FC<NoticaTextProps> = ({ children, className = '' }) => {
  return (
    <span className={`notica-text ${className}`} style={{ letterSpacing: '0.18em' }}>
      {children}
    </span>
  );
};

export default NoticaText;
