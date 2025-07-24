
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const UserHeader: React.FC = () => {
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();
  
  if (!user) return null;
  
  return (
    <div className={`bg-white p-4 rounded-lg shadow-sm mb-6 ${
      isMobile ? 'flex flex-col gap-3' : 'flex items-center justify-between'
    }`}>
      <div className="flex items-center gap-3">
        <div className="bg-slate-100 p-2 rounded-full">
          <User className="h-5 w-5 text-encourager" />
        </div>
        <div>
          <p className="text-sm text-slate-500">Signed in as</p>
          <p className="text-sm text-slate-500">{user.email}</p>
        </div>
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={signOut}
        className={isMobile ? 'w-full' : ''}
      >
        Sign Out
      </Button>
    </div>
  );
};

export default UserHeader;
