
import React from 'react';
import { CircleGauge } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="py-6 border-t mt-12 bg-white">
      <div className="max-w-5xl mx-auto px-4 text-center text-sm text-slate-500">
        <div className="flex items-center justify-center gap-2 mb-2">
          <CircleGauge style={{ color: '#3a6859' }} size={18} strokeWidth={1.5} />
          <span style={{ color: '#3a6859' }}>Leader Leap Assessment Tool</span> &copy; {new Date().getFullYear()}
        </div>
        <div className="flex items-center justify-center gap-4 text-xs">
          <Link 
            to="/privacy-notice" 
            className="text-slate-500 hover:text-encourager transition-colors"
          >
            Privacy Notice
          </Link>
          <span className="text-slate-300">|</span>
          <a 
            href="mailto:info@encouragercoaching.com" 
            className="text-slate-500 hover:text-encourager transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Contact Us
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
