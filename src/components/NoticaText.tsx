
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
            marginRight: '1.2em', // Increased even more from 0.75em
            fontSize: '1.5em',    // Bigger font size
            fontWeight: '900',    // Maximum font weight
            color: 'inherit',
            textShadow: '0px 0px 1px currentColor' // Add subtle text shadow for emphasis
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </div>
  );
};

export default NoticaText;
