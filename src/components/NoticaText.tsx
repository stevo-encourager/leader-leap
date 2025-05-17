
import React from 'react';

interface NoticaTextProps {
  children: React.ReactNode;
  className?: string;
}

const NoticaText: React.FC<NoticaTextProps> = ({ children, className = '' }) => {
  return (
    <div className={`${className}`}>
      {String(children).split('').map((char, index) => (
        <span 
          key={index} 
          className="font-notica inline-block uppercase"
          style={{ 
            marginRight: '0.75em', 
            fontSize: '1.2em', 
            fontWeight: 'bold' 
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </div>
  );
};

export default NoticaText;
