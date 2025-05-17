
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Category, Demographics } from '../utils/assessmentData';
import SkillGapChart from './SkillGapChart';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ResultsDashboardProps {
  categories: Category[];
  demographics?: Demographics;
  onRestart: () => void;
}
