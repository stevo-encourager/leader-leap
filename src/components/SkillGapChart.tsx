
import React from 'react';
import { 
  ResponsiveContainer,
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  Radar, 
  Legend, 
  Tooltip
} from 'recharts';
import { Category } from '@/utils/assessmentData';

interface SkillGapChartProps {
  categories: Category[];
}

interface ChartData {
  subject: string;
  current: number;
  desired: number;
  fullMark: number;
}

const SkillGapChart: React.FC<SkillGapChartProps> = ({ categories }) => {
  // Prepare chart data from categories
  const prepareChartData = (): ChartData[] => {
    return categories.map(category => ({
      subject: category.title,
      current: category.skills.reduce((sum, skill) => sum + skill.ratings.current, 0) / category.skills.length,
      desired: category.skills.reduce((sum, skill) => sum + skill.ratings.desired, 0) / category.skills.length,
      fullMark: 10
    }));
  };

  const chartData = prepareChartData();

  return (
    <div className="radar-chart-container w-full" style={{ height: '600px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart 
          cx="50%" 
          cy="50%" 
          outerRadius="65%" 
          data={chartData}
          margin={{ top: 20, right: 30, bottom: 10, left: 30 }}
        >
          <PolarGrid gridType="circle" stroke="#e5e7eb" />
          <PolarAngleAxis 
            dataKey="subject"
            tick={(props) => {
              const { payload, x, y, cx, cy } = props;
              const categoryName = payload.value;
              
              // Calculate angle for better text positioning
              const angle = (Math.atan2(y - cy, x - cx) * 180) / Math.PI;
              
              // Determine text anchor based on angle
              let textAnchor = "middle";
              if (angle < -80 || angle > 80) textAnchor = "middle";
              else if (angle < 0) textAnchor = "end";
              else textAnchor = "start";
              
              // Shorten text if too long
              const displayName = categoryName.length > 12 
                ? categoryName.substring(0, 10) + '...' 
                : categoryName;
              
              // Adjust vertical position based on angle
              const dy = (angle < -80 || angle > 80) ? -5 : 4;
              
              return (
                <g>
                  <text
                    x={x}
                    y={y}
                    textAnchor={textAnchor}
                    fill="#2F564D"
                    fontSize={11}
                    fontWeight={500}
                    dy={dy}
                    transform={`rotate(${(angle < -90 || angle > 90) ? 180 : 0}, ${x}, ${y})`}
                  >
                    {displayName}
                  </text>
                </g>
              );
            }}
            tickLine={false}
            stroke="#2F564D"
          />
          <Radar
            name="Current Skills"
            dataKey="current"
            stroke="#2F564D"
            fill="#2F564D"
            fillOpacity={0.4}
            dot
            activeDot={{ r: 6 }}
          />
          <Radar
            name="Desired Skills"
            dataKey="desired"
            stroke="#8baca5"
            fill="#8baca5"
            fillOpacity={0.4}
            dot
            activeDot={{ r: 6 }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              borderColor: '#e5e7eb',
              borderRadius: '6px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              padding: '8px 12px'
            }} 
            formatter={(value, name) => {
              // Safely format value whether it's a number or string
              const formattedValue = typeof value === 'number' ? value.toFixed(1) : value;
              return [formattedValue, name];
            }}
            labelStyle={{
              fontWeight: 500,
              marginBottom: '4px'
            }}
          />
          <Legend 
            iconType="circle" 
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ 
              paddingTop: 30,
              fontSize: '13px',
              fontWeight: 500
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SkillGapChart;
