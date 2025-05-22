
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CircleGauge } from 'lucide-react';

interface EmptyAssessmentsListProps {
  isLoading: boolean;
}

const EmptyAssessmentsList = ({ isLoading }: EmptyAssessmentsListProps) => {
  return (
    <Card className="p-6 text-center">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-4">
          <CircleGauge className="text-encourager animate-spin" size={32} />
          <p className="mt-2 text-slate-500">Loading your assessments...</p>
        </div>
      ) : (
        <>
          <p className="mb-4 text-slate-600">You haven't completed any assessments yet.</p>
          <Link to="/assessment">
            <Button className="bg-encourager hover:bg-encourager-light">
              Start an Assessment
            </Button>
          </Link>
        </>
      )}
    </Card>
  );
};

export default EmptyAssessmentsList;
