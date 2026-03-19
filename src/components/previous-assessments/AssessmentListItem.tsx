
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

interface AssessmentListItemProps {
  id: string;
  created_at: string;
}

const AssessmentListItem = ({ id, created_at }: AssessmentListItemProps) => {
  return (
    <Card key={id} className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <div
          className="w-full p-6 text-left flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h3 className="font-medium text-lg" style={{ color: '#3a6859' }}>
              Leadership Gap Assessment
            </h3>
            <p className="text-slate-500 text-sm">
              Completed on {formatDate(created_at)}
            </p>
            <p className="text-slate-400 text-xs">
              ID: {id}
            </p>
          </div>
          <Link to={`/results/${id}`}>
            <Button 
              size="sm" 
              className="text-white"
              style={{ backgroundColor: '#69bda2' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#7ac9b0'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#69bda2'}
            >
              View Results
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssessmentListItem;
