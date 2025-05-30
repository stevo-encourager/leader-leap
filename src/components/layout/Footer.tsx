
import React from 'react';
import { CircleGauge } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="py-6 border-t mt-12 bg-white">
      <div className="max-w-5xl mx-auto px-4 text-center text-sm text-slate-500">
        <div className="flex items-center justify-center gap-2">
          <CircleGauge className="text-encourager-accent" size={18} strokeWidth={1.5} />
          Leader Leap Assessment Tool &copy; {new Date().getFullYear()}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
