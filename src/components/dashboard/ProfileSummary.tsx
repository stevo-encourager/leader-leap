
import React from 'react';
import { Demographics } from '../../utils/assessmentData';

interface ProfileSummaryProps {
  demographics: Demographics;
}

const ProfileSummary: React.FC<ProfileSummaryProps> = ({ demographics }) => {
  if (!demographics.role && !demographics.industry && !demographics.yearsOfExperience) {
    return null;
  }

  return (
    <div className="bg-slate-50 p-4 rounded-lg">
      <h3 className="text-lg font-medium mb-2">Your Profile</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {demographics.role && (
          <div>
            <p className="text-sm text-slate-500">Role</p>
            <p className="font-medium">{demographics.role}</p>
          </div>
        )}
        {demographics.industry && (
          <div>
            <p className="text-sm text-slate-500">Industry</p>
            <p className="font-medium">{demographics.industry}</p>
          </div>
        )}
        {demographics.yearsOfExperience && (
          <div>
            <p className="text-sm text-slate-500">Leadership Experience</p>
            <p className="font-medium">{demographics.yearsOfExperience}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSummary;
