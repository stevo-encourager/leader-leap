
import React from 'react';
import { Demographics } from '@/utils/assessmentTypes';

interface ProfileSummaryProps {
  demographics: Demographics;
}

const ProfileSummary: React.FC<ProfileSummaryProps> = ({ demographics }) => {
  if (!demographics.age && !demographics.industry && !demographics.experience) {
    return null;
  }

  return (
    <div className="bg-slate-50 p-4 rounded-lg">
      <h3 className="text-lg font-medium mb-2">Your Profile</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {demographics.age && (
          <div>
            <p className="text-sm text-slate-500">Age</p>
            <p className="font-medium">{demographics.age}</p>
          </div>
        )}
        {demographics.industry && (
          <div>
            <p className="text-sm text-slate-500">Industry</p>
            <p className="font-medium">{demographics.industry}</p>
          </div>
        )}
        {demographics.experience && (
          <div>
            <p className="text-sm text-slate-500">Experience Level</p>
            <p className="font-medium">{demographics.experience}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSummary;
