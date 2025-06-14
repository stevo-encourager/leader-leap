
import React, { useState, useCallback } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Demographics } from '@/utils/assessmentTypes';

const demographicsSchema = z.object({
  age: z.string().refine(value => {
    const num = Number(value);
    return !isNaN(num) && num > 0 && num < 120;
  }, {
    message: "Please enter a valid age between 1 and 120.",
  }),
  gender: z.string().min(1, { message: "Please select a gender." }),
  industry: z.string().min(2, { message: "Please enter your industry." }),
  experience: z.string().min(1, { message: "Please select your experience level." }),
});

interface DemographicsFormProps {
  demographics: Demographics;
  onDemographicsUpdate: (demographics: Demographics) => void;
  onContinue: () => void;
  onBack: () => void;
}

const DemographicsForm: React.FC<DemographicsFormProps> = ({ 
  demographics, 
  onDemographicsUpdate, 
  onContinue, 
  onBack 
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    getValues,
    trigger,
  } = useForm<Demographics>({
    resolver: zodResolver(demographicsSchema),
    defaultValues: demographics,
    mode: "onChange"
  });

  // Initialize form values from props on mount
  React.useEffect(() => {
    Object.keys(demographics).forEach(key => {
      setValue(key as keyof Demographics, demographics[key as keyof Demographics], { 
        shouldValidate: true,
        shouldDirty: false 
      });
    });
  }, [demographics, setValue]);

  const onSubmit = useCallback((data: Demographics) => {
    onDemographicsUpdate(data);
    onContinue();
  }, [onDemographicsUpdate, onContinue]);

  return (
    <div className="fade-in">
      <Card className="max-w-2xl mx-auto shadow-card border-none bg-white">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold text-encourager">About You</CardTitle>
          <CardDescription className="text-slate-600">
            Help us personalize your assessment results and recommendations
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="age">Age</Label>
            <Controller
              control={control}
              name="age"
              render={({ field }) => (
                <Input 
                  id="age" 
                  placeholder="Enter your age" 
                  {...field} 
                  className={cn(errors.age ? "border-destructive" : "")}
                />
              )}
            />
            {errors.age && (
              <p className="text-sm text-destructive">{errors.age.message}</p>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="gender">Gender</Label>
            <Controller
              control={control}
              name="gender"
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger className={cn("w-full", errors.gender ? "border-destructive" : "")}>
                    <SelectValue placeholder="Select your gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer_not_to_say">Prefer Not to Say</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.gender && (
              <p className="text-sm text-destructive">{errors.gender.message}</p>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="industry">Industry</Label>
            <Controller
              control={control}
              name="industry"
              render={({ field }) => (
                <Input 
                  id="industry" 
                  placeholder="Enter your industry" 
                  {...field} 
                  className={cn(errors.industry ? "border-destructive" : "")}
                />
              )}
            />
            {errors.industry && (
              <p className="text-sm text-destructive">{errors.industry.message}</p>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="experience">Experience Level</Label>
            <Controller
              control={control}
              name="experience"
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger className={cn("w-full", errors.experience ? "border-destructive" : "")}>
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry_level">Entry Level</SelectItem>
                    <SelectItem value="mid_level">Mid Level</SelectItem>
                    <SelectItem value="senior_level">Senior Level</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.experience && (
              <p className="text-sm text-destructive">{errors.experience.message}</p>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between pt-6">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Button>
          
          <Button 
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={!isValid}
            className="bg-encourager hover:bg-encourager-light text-white flex items-center gap-2"
          >
            Continue to Instructions
            <ArrowRight 
              size={16} 
              className={`transition-transform ${!isValid ? 'opacity-50' : ''}`}
            />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DemographicsForm;
