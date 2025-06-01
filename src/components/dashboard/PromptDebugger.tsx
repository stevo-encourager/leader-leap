
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { RefreshCw, Bug, AlertCircle, CheckCircle } from 'lucide-react';
import { Category, Demographics } from '@/utils/assessmentTypes';

interface PromptDebuggerProps {
  categories: Category[];
  demographics: Demographics;
  averageGap: number;
  assessmentId?: string;
}

const PromptDebugger: React.FC<PromptDebuggerProps> = ({ 
  categories, 
  demographics, 
  averageGap, 
  assessmentId 
}) => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testPrompt = async (forceRegenerate = false) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Testing prompt with:', { categories: categories.length, demographics, assessmentId, forceRegenerate });
      
      const { data, error: functionError } = await supabase.functions.invoke('generate-insights', {
        body: {
          categories,
          demographics,
          averageGap,
          assessmentId,
          forceRegenerate
        }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      setDebugInfo(data);
      console.log('Prompt test results:', data);
    } catch (err) {
      console.error('Error testing prompt:', err);
      setError(err instanceof Error ? err.message : 'Failed to test prompt');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mt-6 border-orange-200 bg-orange-50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bug className="h-5 w-5 text-orange-600" />
          <CardTitle className="text-orange-800">Prompt Debugger</CardTitle>
        </div>
        <CardDescription className="text-orange-700">
          Test which prompt version is being used and verify new insights generation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3">
          <Button 
            onClick={() => testPrompt(false)}
            disabled={isLoading}
            variant="outline"
            className="border-orange-300 hover:bg-orange-100"
          >
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
            Test Current Insights
          </Button>
          
          <Button 
            onClick={() => testPrompt(true)}
            disabled={isLoading}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
            Force Regenerate with New Prompt
          </Button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        {debugInfo && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-green-700">Debug information retrieved</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Prompt Source:</label>
                <Badge 
                  variant={debugInfo.promptUsed === 'CURRENT_PROMPT_VERSION' ? 'default' : 'secondary'}
                  className="ml-2"
                >
                  {debugInfo.promptUsed === 'CURRENT_PROMPT_VERSION' ? 'NEW PROMPT' : 'CACHED INSIGHTS'}
                </Badge>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Regenerated:</label>
                <Badge 
                  variant={debugInfo.regenerated ? 'default' : 'secondary'}
                  className="ml-2"
                >
                  {debugInfo.regenerated ? 'YES' : 'NO'}
                </Badge>
              </div>
            </div>

            {debugInfo.debugInfo && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-800">New Prompt Features Detected:</h4>
                <div className="grid grid-cols-3 gap-2">
                  <Badge variant={debugInfo.debugInfo.hasNewPromptFeatures?.bannedPhrases ? 'default' : 'destructive'}>
                    Banned Phrases: {debugInfo.debugInfo.hasNewPromptFeatures?.bannedPhrases ? 'Yes' : 'No'}
                  </Badge>
                  <Badge variant={debugInfo.debugInfo.hasNewPromptFeatures?.personalizationMandate ? 'default' : 'destructive'}>
                    Personalization: {debugInfo.debugInfo.hasNewPromptFeatures?.personalizationMandate ? 'Yes' : 'No'}
                  </Badge>
                  <Badge variant={debugInfo.debugInfo.hasNewPromptFeatures?.resourceLinking ? 'default' : 'destructive'}>
                    Resource Linking: {debugInfo.debugInfo.hasNewPromptFeatures?.resourceLinking ? 'Yes' : 'No'}
                  </Badge>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Demographics Used:</label>
                  <Textarea 
                    value={JSON.stringify(debugInfo.debugInfo.demographics, null, 2)}
                    readOnly
                    className="mt-1 text-xs"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Prompt Length:</label>
                  <span className="ml-2 text-sm text-gray-600">{debugInfo.debugInfo.promptLength} characters</span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-orange-700 bg-orange-100 p-3 rounded-md">
          <strong>How to interpret results:</strong>
          <ul className="mt-1 space-y-1 list-disc list-inside">
            <li><strong>CACHED INSIGHTS:</strong> Using old insights generated with previous prompt</li>
            <li><strong>NEW PROMPT:</strong> Generated fresh insights with your updated prompt</li>
            <li><strong>Force Regenerate:</strong> Will always use the current prompt, even for existing assessments</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default PromptDebugger;
