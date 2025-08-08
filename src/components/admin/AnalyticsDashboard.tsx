import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { RefreshCw, BarChart3, TrendingUp, Users, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { adminLogger } from '@/utils/logger';

interface AnalyticsData {
  competencyAverages: {
    [competencyId: string]: {
      title: string;
      avgCurrent: number;
      avgDesired: number;
      avgGap: number;
      assessmentCount: number;
    }
  };
  skillGaps: {
    [skillId: string]: {
      name: string;
      categoryTitle: string;
      avgCurrent: number;
      avgDesired: number;
      avgGap: number;
      assessmentCount: number;
    }
  };
  demographicTrends: {
    byRole: { [role: string]: { avgGap: number; count: number } };
    byExperience: { [level: string]: { avgGap: number; count: number } };
    byIndustry: { [industry: string]: { avgGap: number; count: number } };
  };
  assessmentTrends: {
    monthlyCompletions: { [month: string]: number };
    completionRate: number;
    averageAssessmentTime: number;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError(null);
    adminLogger.info("Fetching analytics data...");
    
    try {
      const { data: analyticsResponse, error: analyticsError } = await supabase.functions.invoke('analytics-aggregated-data');
      
      if (analyticsError) {
        adminLogger.error("Error getting analytics", analyticsError);
        throw new Error(`Error getting analytics: ${analyticsError.message}`);
      }
      
      adminLogger.debug("Analytics response", analyticsResponse);
      
      if (!analyticsResponse.success) {
        throw new Error(analyticsResponse.error || "Failed to get analytics data");
      }
      
      setAnalyticsData(analyticsResponse.data);
      setLastUpdated(new Date().toLocaleString());
      
      adminLogger.info("Analytics data loaded successfully");
      
    } catch (error: any) {
      adminLogger.error('Error fetching analytics', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    adminLogger.info("Component mounted, fetching analytics...");
    fetchAnalytics();
  }, []);

  // Transform data for charts
  const competencyChartData = analyticsData ? Object.entries(analyticsData.competencyAverages).map(([id, data]) => ({
    name: data.title,
    current: data.avgCurrent,
    desired: data.avgDesired,
    gap: data.avgGap,
    assessments: data.assessmentCount
  })).sort((a, b) => b.gap - a.gap) : [];

  const skillGapData = analyticsData ? Object.entries(analyticsData.skillGaps)
    .map(([id, data]) => ({
      name: data.name,
      category: data.categoryTitle,
      current: data.avgCurrent,
      desired: data.avgDesired,
      gap: data.avgGap,
      assessments: data.assessmentCount
    }))
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 20) : []; // Top 20 skills by gap

  const demographicRoleData = analyticsData ? Object.entries(analyticsData.demographicTrends.byRole)
    .map(([role, data]) => ({
      name: role,
      avgGap: data.avgGap,
      count: data.count
    }))
    .sort((a, b) => b.count - a.count) : [];

  const monthlyTrendData = analyticsData ? Object.entries(analyticsData.assessmentTrends.monthlyCompletions)
    .map(([month, count]) => ({
      name: month,
      completions: count
    }))
    .sort((a, b) => a.name.localeCompare(b.name)) : [];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  adminLogger.debug("Rendering with data", { analyticsData, isLoading });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Aggregated insights from all assessment data
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={fetchAnalytics}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </>
          )}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading analytics</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {lastUpdated && (
        <div className="text-sm text-muted-foreground">
          Last updated: {lastUpdated}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mr-3" />
          <span>Loading analytics data...</span>
        </div>
      ) : analyticsData ? (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="competencies">Competencies</TabsTrigger>
            <TabsTrigger value="skills">Skill Gaps</TabsTrigger>
            <TabsTrigger value="demographics">Demographics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Competencies</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{competencyChartData.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Tracked competencies
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Skills</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Object.keys(analyticsData.skillGaps).length}</div>
                  <p className="text-xs text-muted-foreground">
                    Individual skills tracked
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Gap</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {competencyChartData.length > 0 
                      ? (competencyChartData.reduce((sum, item) => sum + item.gap, 0) / competencyChartData.length).toFixed(1)
                      : '0'
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Average competency gap
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.assessmentTrends.completionRate}%</div>
                  <p className="text-xs text-muted-foreground">
                    Assessment completion rate
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Competency Overview Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Competency Averages</CardTitle>
                <CardDescription>
                  Average current vs desired ratings across all competencies
                </CardDescription>
              </CardHeader>
              <CardContent>
                                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={competencyChartData.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={150} fontSize={12} />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="current" fill="#8884d8" name="Current" />
                      <Bar dataKey="desired" fill="#82ca9d" name="Desired" />
                    </BarChart>
                  </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Monthly Trends */}
            {monthlyTrendData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Assessment Completions Over Time</CardTitle>
                  <CardDescription>
                    Monthly assessment completion trends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="completions" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="competencies" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Competency Performance</CardTitle>
                <CardDescription>
                  Detailed breakdown of competency averages and gaps
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={competencyChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={150} fontSize={12} />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="current" fill="#8884d8" name="Current" />
                      <Bar dataKey="desired" fill="#82ca9d" name="Desired" />
                    </BarChart>
                  </ResponsiveContainer>

                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Competency</TableHead>
                          <TableHead>Avg Current</TableHead>
                          <TableHead>Avg Desired</TableHead>
                          <TableHead>Avg Gap</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {competencyChartData.map((competency, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{competency.name}</TableCell>
                            <TableCell>{competency.current.toFixed(1)}</TableCell>
                            <TableCell>{competency.desired.toFixed(1)}</TableCell>
                            <TableCell className={competency.desired > competency.current ? 'text-red-600 font-medium' : ''}>
                              {competency.gap.toFixed(1)}
                            </TableCell>

                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Detailed Competency Skills Table */}
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">Detailed Competency Skills Breakdown</h3>
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Competency</TableHead>
                            <TableHead>Skill</TableHead>
                            <TableHead>Avg Current</TableHead>
                            <TableHead>Avg Desired</TableHead>
                            <TableHead>Avg Gap</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {competencyChartData.map((competencyChartItem) => {
                            // Find the competency data by title
                            const competencyEntry = Object.entries(analyticsData.competencyAverages)
                              .find(([id, data]) => data.title === competencyChartItem.name);
                            
                            if (!competencyEntry) return null;
                            
                            const [competencyId, competencyData] = competencyEntry;
                            
                            // Get skills for this competency
                            const competencySkills = Object.entries(analyticsData.skillGaps)
                              .filter(([skillId, skillData]) => skillData.categoryTitle === competencyData.title)
                              .sort((a, b) => b[1].avgGap - a[1].avgGap);

                            return competencySkills.map(([skillId, skillData], skillIndex) => {
                              const isFirstSkillInCompetency = skillIndex === 0;
                              const competencyIndex = competencyChartData.findIndex(item => item.name === competencyData.title);
                              const isAlternateCompetency = competencyIndex % 2 === 1;
                              
                              return (
                                <TableRow 
                                  key={`${competencyId}-${skillId}`}
                                  className={isAlternateCompetency ? "bg-gray-50" : ""}
                                >
                                  <TableCell className={isFirstSkillInCompetency ? "font-medium" : "text-muted-foreground"}>
                                    {isFirstSkillInCompetency ? competencyData.title : ""}
                                  </TableCell>
                                  <TableCell className="font-medium">{skillData.name}</TableCell>
                                  <TableCell>{skillData.avgCurrent.toFixed(1)}</TableCell>
                                  <TableCell>{skillData.avgDesired.toFixed(1)}</TableCell>
                                                                  <TableCell className={skillData.avgDesired > skillData.avgCurrent ? 'text-red-600 font-medium' : ''}>
                                  {skillData.avgGap.toFixed(1)}
                                </TableCell>

                                </TableRow>
                              );
                            });
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Skill Gaps</CardTitle>
                <CardDescription>
                  Skills with the largest average gaps (top 20)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                                              <TableRow>
                          <TableHead>Skill</TableHead>
                          <TableHead>Competency</TableHead>
                          <TableHead>Avg Current</TableHead>
                          <TableHead>Avg Desired</TableHead>
                          <TableHead>Avg Gap</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                      {skillGapData.map((skill, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{skill.name}</TableCell>
                          <TableCell>{skill.category}</TableCell>
                          <TableCell>{skill.current.toFixed(1)}</TableCell>
                          <TableCell>{skill.desired.toFixed(1)}</TableCell>
                          <TableCell className={skill.desired > skill.current ? 'text-red-600 font-medium' : ''}>
                            {skill.gap.toFixed(1)}
                          </TableCell>

                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="demographics" className="mt-6 space-y-6">
            {/* Role-based trends */}
            {demographicRoleData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Performance by Role</CardTitle>
                  <CardDescription>
                    Average gaps by role type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={demographicRoleData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="avgGap" fill="#8884d8" name="Average Gap" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Experience-based trends */}
            {Object.keys(analyticsData.demographicTrends.byExperience).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Performance by Experience Level</CardTitle>
                  <CardDescription>
                    Average gaps by years of experience
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Experience Level</TableHead>
                          <TableHead>Avg Gap</TableHead>
                          <TableHead>Count</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(analyticsData.demographicTrends.byExperience)
                          .sort((a, b) => b[1].count - a[1].count)
                          .map(([experience, data], index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{experience}</TableCell>
                              <TableCell>{data.avgGap.toFixed(1)}</TableCell>
                              <TableCell>{data.count}</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Industry-based trends */}
            {Object.keys(analyticsData.demographicTrends.byIndustry).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Performance by Industry</CardTitle>
                  <CardDescription>
                    Average gaps by industry
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Industry</TableHead>
                          <TableHead>Avg Gap</TableHead>
                          <TableHead>Count</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(analyticsData.demographicTrends.byIndustry)
                          .sort((a, b) => b[1].count - a[1].count)
                          .map(([industry, data], index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{industry}</TableCell>
                              <TableCell>{data.avgGap.toFixed(1)}</TableCell>
                              <TableCell>{data.count}</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          No analytics data available
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard; 