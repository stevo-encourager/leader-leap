
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getAssessmentHistory } from '@/services/assessmentService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CircleGauge, ArrowLeft } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const PreviousAssessments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchAssessments = async () => {
      setLoading(true);
      try {
        const result = await getAssessmentHistory();
        if (result.success && result.data) {
          setAssessments(result.data);
        }
      } catch (error) {
        console.error('Error fetching assessment history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <CircleGauge className="text-encourager animate-spin mx-auto" size={32} />
          <p className="mt-2 text-slate-500">Loading your previous assessments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-6 flex items-center gap-2">
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Button>

        <h1 className="text-3xl font-bold text-encourager mb-8">Your Previous Assessments</h1>

        {assessments.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="mb-4 text-slate-600">You haven't completed any assessments yet.</p>
            <Button onClick={() => navigate('/')} className="bg-encourager hover:bg-encourager-light">
              Start an Assessment
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {assessments.map((assessment) => (
              <Card key={assessment.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <button
                    onClick={() => navigate(`/results/${assessment.id}`)}
                    className="w-full p-6 text-left flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                  >
                    <div>
                      <h3 className="font-medium text-lg text-encourager">
                        Leadership Gap Assessment
                      </h3>
                      <p className="text-slate-500 text-sm">
                        Completed on {formatDate(assessment.created_at)}
                      </p>
                    </div>
                    <Button size="sm" className="bg-encourager hover:bg-encourager-light">
                      View Results
                    </Button>
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviousAssessments;
