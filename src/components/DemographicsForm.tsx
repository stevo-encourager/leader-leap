
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Demographics } from '../utils/assessmentData';
import { Briefcase, Building, User, ArrowLeft } from 'lucide-react';

interface DemographicsFormProps {
  demographics: Demographics;
  onDemographicsUpdate: (demographics: Demographics) => void;
  onContinue: () => void;
  onBack: () => void;
}

const roleOptions = [
  "Individual Contributor",
  "Manager",
  "Team Lead",
  "Director",
  "VP",
  "C-Level",
  "Founder/Owner",
  "Consultant",
  "Other"
];

const industryOptions = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Manufacturing",
  "Retail",
  "Government",
  "Nonprofit",
  "Other"
];

const experienceOptions = [
  "Less than 1 year",
  "1-3 years",
  "4-7 years",
  "8-12 years",
  "13-20 years",
  "20+ years"
];

const DemographicsForm: React.FC<DemographicsFormProps> = ({ demographics, onDemographicsUpdate, onContinue, onBack }) => {
  
  const handleRoleChange = (value: string) => {
    onDemographicsUpdate({ ...demographics, role: value });
  };

  const handleIndustryChange = (value: string) => {
    onDemographicsUpdate({ ...demographics, industry: value });
  };

  const handleExperienceChange = (value: string) => {
    onDemographicsUpdate({ ...demographics, yearsOfExperience: value });
  };

  return (
    <div className="fade-in">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">About You (Optional)</CardTitle>
          <CardDescription>
            Help us understand your background and context. This information is optional but helps provide better insights.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="role" className="flex items-center gap-2">
                <User className="text-primary h-4 w-4" />
                Your Role
              </Label>
              <Select value={demographics.role} onValueChange={handleRoleChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((role) => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="industry" className="flex items-center gap-2">
                <Building className="text-primary h-4 w-4" />
                Industry
              </Label>
              <Select value={demographics.industry} onValueChange={handleIndustryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  {industryOptions.map((industry) => (
                    <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="experience" className="flex items-center gap-2">
                <Briefcase className="text-primary h-4 w-4" />
                Leadership Experience
              </Label>
              <Select value={demographics.yearsOfExperience} onValueChange={handleExperienceChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Years of leadership experience" />
                </SelectTrigger>
                <SelectContent>
                  {experienceOptions.map((exp) => (
                    <SelectItem key={exp} value={exp}>{exp}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-blue-50 text-blue-700 p-4 rounded-md">
              <p className="text-sm">
                <strong>Note:</strong> All demographic information is optional and used only to provide more tailored insights in your results.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button onClick={onContinue}>
            Continue to Assessment
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DemographicsForm;
