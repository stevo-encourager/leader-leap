-- Create the action_plans table
-- Run this SQL in your Supabase dashboard SQL editor

CREATE TABLE IF NOT EXISTS public.action_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  assessment_id UUID REFERENCES public.assessment_results(id) ON DELETE CASCADE NOT NULL,
  competency_name TEXT NOT NULL,
  skill_name TEXT,
  gap_score DECIMAL(3,1) NOT NULL,
  goals JSONB DEFAULT '[]'::jsonb,
  quarterly_milestones JSONB DEFAULT '{}'::jsonb,
  plan_text TEXT DEFAULT '',
  actions_text TEXT DEFAULT '',
  resources JSONB DEFAULT '[]'::jsonb,
  overall_progress INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.action_plans ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_action_plans_user_id ON action_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_action_plans_assessment_id ON action_plans(assessment_id);
CREATE INDEX IF NOT EXISTS idx_action_plans_status ON action_plans(status);
CREATE INDEX IF NOT EXISTS idx_action_plans_created_at ON action_plans(created_at);

-- Create unique constraint to ensure one plan per competency per assessment
CREATE UNIQUE INDEX IF NOT EXISTS idx_action_plans_unique_competency 
ON action_plans(user_id, assessment_id, competency_name);

-- RLS Policies
-- Users can only read their own action plans
CREATE POLICY "Users can read their own action plans" 
ON public.action_plans 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own action plans
CREATE POLICY "Users can insert their own action plans" 
ON public.action_plans 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own action plans
CREATE POLICY "Users can update their own action plans" 
ON public.action_plans 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own action plans
CREATE POLICY "Users can delete their own action plans" 
ON public.action_plans 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_action_plans_updated_at 
    BEFORE UPDATE ON action_plans 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 