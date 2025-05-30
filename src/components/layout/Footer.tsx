
import React from 'react';
import { CircleGauge } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="py-6 border-t mt-12 bg-white">
      <div className="max-w-5xl mx-auto px-4 text-center text-sm text-slate-500">
        <div className="flex items-center justify-center gap-2 mb-2">
          <CircleGauge className="text-encourager-accent" size={18} strokeWidth={1.5} />
          Leader Leap Assessment Tool &copy; {new Date().getFullYear()}
        </div>
        <div className="flex items-center justify-center gap-4 text-xs">
          <Link 
            to="/privacy" 
            className="text-slate-500 hover:text-encourager transition-colors"
          >
            Privacy Policy
          </Link>
          <span className="text-slate-300">|</span>
          <a 
            href="mailto:info@encouragercoaching.com" 
            className="text-slate-500 hover:text-encourager transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
