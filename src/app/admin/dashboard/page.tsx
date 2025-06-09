
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, LineChart, PieChart as RechartsPieChart, Bar, Line, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
// Import the new generation functions and the static menu items
import { PLACEHOLDER_MENU_ITEMS, generatePlaceholderOrders, generatePlaceholderAnalyticsData } from "@/lib/placeholder-data";
import type { AnalyticsData, MenuItem } from "@/lib/types"; // Added MenuItem type
import { IndianRupee, ShoppingBag, Users, TrendingUp, Lightbulb, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { formatInr } from "@/lib/currency-utils";
import { cn } from "@/lib/utils";
import { generateDashboardInsights, type DashboardAnalyticsInput, type GenerateDashboardInsightsResponse } from '@/ai/flows/generate-dashboard-insights-flow';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";


const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

function KPICardSkeleton() {
  return (
    <Card className="shadow-lg animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-2/5" /> {/* CardTitle Skeleton */}
        <Skeleton className="h-5 w-5 rounded-sm" /> {/* Icon Skeleton */}
      </CardHeader>
      <CardContent>
        <Skeleton className="h-7 w-3/5 mb-1" /> {/* Value Skeleton */}
        <Skeleton className="h-3 w-4/5" /> {/* Change Skeleton */}
      </CardContent>
    </Card>
  );
}

function ChartCardSkeleton({ height = 300, className }: { height?: number, className?: string }) {
  return (
    <Card className={cn("shadow-lg animate-fade-in", className)}>
      <CardHeader>
        <Skeleton className="h-6 w-1/2 mb-1" /> {/* CardTitle Skeleton */}
        <Skeleton className="h-4 w-3/4" /> {/* CardDescription Skeleton */}
      </CardHeader>
      <CardContent>
        <Skeleton style={{ height: `${height}px` }} className="w-full" />
      </CardContent>
    </Card>
  );
}

function AiInsightsSkeleton() {
  return (
    <Card className="shadow-lg animate-fade-in">
      <CardHeader>
        <Skeleton className="h-6 w-1/3 mb-1" /> {/* CardTitle: AI Insights */}
        <Skeleton className="h-4 w-1/2" />   {/* CardDescription */}
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </CardContent>
    </Card>
  );
}


function AdminDashboardSkeleton() {
  return (
    <div className="space-y-8 p-1 animate-fade-in">
      <Skeleton className="h-9 w-1/3" /> {/* Page Title Skeleton */}

      <section className="grid gap-6 md:grid-cols-1">
         <AiInsightsSkeleton />
      </section>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array(4).fill(0).map((_, index) => <KPICardSkeleton key={index} />)}
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <ChartCardSkeleton /> {/* Daily Sales */}
        <ChartCardSkeleton /> {/* Most Ordered Dishes */}
      </section>
      
      <section className="grid gap-6 md:grid-cols-2">
        <ChartCardSkeleton /> {/* For Category Revenue */}
        <ChartCardSkeleton height={350} /> {/* For Peak Ordering Hours */}
      </section>

    </div>
  );
}


export default function AdminDashboardPage() {
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [isInsightsLoading, setIsInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [dashboardMessage, setDashboardMessage] = useState<string | null>(null);


  useEffect(() => {
    const loadDashboardData = async () => {
      setIsDashboardLoading(true);
      setDashboardMessage(null);
      let usePlaceholderData = true; 

      try {
        const settingsRes = await fetch('/api/settings');
        if (settingsRes.ok) {
          const settingsResult = await settingsRes.json();
          if (settingsResult.success && settingsResult.data) {
            usePlaceholderData = settingsResult.data.usePlaceholderData;
          } else {
            console.warn('Failed to parse settings or API error, defaulting to placeholder data. Error:', settingsResult.error);
          }
        } else {
          const errorData = await settingsRes.json().catch(() => ({}));
          console.warn(`Failed to fetch settings (status: ${settingsRes.status}, error: ${errorData?.error}), defaulting to placeholder data.`);
        }
      } catch (error) {
        console.error('Error fetching settings, defaulting to placeholder data:', error);
      }

      if (usePlaceholderData) {
        console.log("Admin Dashboard: Using placeholder data (generating fresh).");
        const currentPlaceholderMenuItems = PLACEHOLDER_MENU_ITEMS as MenuItem[];
        const currentPlaceholderOrders = generatePlaceholderOrders(currentPlaceholderMenuItems);
        const dynamicPlaceholderAnalytics = generatePlaceholderAnalyticsData(currentPlaceholderMenuItems, currentPlaceholderOrders);
        setAnalyticsData(dynamicPlaceholderAnalytics);
        setDashboardMessage("Displaying freshly generated sample data. Toggle 'Use Placeholder Dashboard Data' in settings for live data.");
      } else {
        console.log("Admin Dashboard: Attempting to fetch live data.");
        try {
          const liveDataRes = await fetch('/api/analytics/dashboard');
          if (liveDataRes.ok) {
            const liveDataResult = await liveDataRes.json();
            if (liveDataResult.success && liveDataResult.data) {
              // Fallback to placeholder generation for parts not yet in live API for initial structure
              const basePlaceholderMenuItems = PLACEHOLDER_MENU_ITEMS as MenuItem[];
              const basePlaceholderOrders = generatePlaceholderOrders(basePlaceholderMenuItems);
              const basePlaceholderAnalytics = generatePlaceholderAnalyticsData(basePlaceholderMenuItems, basePlaceholderOrders);

              setAnalyticsData({
                ...basePlaceholderAnalytics, // Start with full placeholder structure
                ...liveDataResult.data, // Override with fetched live data
                // Ensure placeholders are used for parts not yet in live API OR if live data for them is empty
                mostOrderedDishes: liveDataResult.data.mostOrderedDishes && liveDataResult.data.mostOrderedDishes.length > 0 
                                     ? liveDataResult.data.mostOrderedDishes 
                                     : basePlaceholderAnalytics.mostOrderedDishes,
                categoryRevenue: liveDataResult.data.categoryRevenue && liveDataResult.data.categoryRevenue.length > 0 
                                   ? liveDataResult.data.categoryRevenue 
                                   : basePlaceholderAnalytics.categoryRevenue,
                weeklySales: liveDataResult.data.weeklySales && liveDataResult.data.weeklySales.length > 0
                                   ? liveDataResult.data.weeklySales
                                   : basePlaceholderAnalytics.weeklySales,
              });
              setDashboardMessage("Displaying live data for some metrics. Other charts may use sample data if live data is partial or not yet implemented in API.");
            } else {
              console.error("Failed to fetch live analytics data from API or API error:", liveDataResult.error);
              const fallbackMenuItems = PLACEHOLDER_MENU_ITEMS as MenuItem[];
              const fallbackOrders = generatePlaceholderOrders(fallbackMenuItems);
              setAnalyticsData(generatePlaceholderAnalyticsData(fallbackMenuItems, fallbackOrders)); 
              setDashboardMessage("Failed to fetch live data. Displaying sample data. Error: " + liveDataResult.error);
            }
          } else {
            const errorText = await liveDataRes.text();
            console.error("Failed to fetch live analytics data, server error:", liveDataRes.status, errorText);
            const fallbackMenuItems = PLACEHOLDER_MENU_ITEMS as MenuItem[];
            const fallbackOrders = generatePlaceholderOrders(fallbackMenuItems);
            setAnalyticsData(generatePlaceholderAnalyticsData(fallbackMenuItems, fallbackOrders));
            setDashboardMessage(`Error fetching live data (status: ${liveDataRes.status}). Displaying sample data.`);
          }
        } catch (fetchError) {
          console.error("Error fetching live analytics data:", fetchError);
          const fallbackMenuItems = PLACEHOLDER_MENU_ITEMS as MenuItem[];
          const fallbackOrders = generatePlaceholderOrders(fallbackMenuItems);
          setAnalyticsData(generatePlaceholderAnalyticsData(fallbackMenuItems, fallbackOrders));
          setDashboardMessage("Network error fetching live data. Displaying sample data.");
        }
      }
      setIsDashboardLoading(false);
    };

    loadDashboardData();
  }, []);


  useEffect(() => {
    if (analyticsData && !isDashboardLoading) {
      const fetchInsights = async () => {
        setIsInsightsLoading(true);
        setInsightsError(null);
        try {
          const inputForFlow: DashboardAnalyticsInput = {
            dailySales: analyticsData.dailySales || [],
            mostOrderedDishes: analyticsData.mostOrderedDishes?.slice(0, 5) || [],
            categoryRevenue: analyticsData.categoryRevenue || [],
            peakOrderingHours: analyticsData.peakOrderingHours || [],
          };
          const result: GenerateDashboardInsightsResponse = await generateDashboardInsights(inputForFlow);
          
          if ('error' in result && result.error) {
            setAiInsights(null);
            setInsightsError(result.error);
          } else if ('insightsText' in result) {
            setAiInsights(result.insightsText);
          } else {
             setInsightsError("Received an unexpected format from AI insights.");
             setAiInsights(null);
          }
        } catch (e: any) {
          setInsightsError(e.message || "Failed to fetch AI insights.");
          setAiInsights(null);
        } finally {
          setIsInsightsLoading(false);
        }
      };
      fetchInsights();
    }
  }, [analyticsData, isDashboardLoading]);


  if (isDashboardLoading || !analyticsData) {
    return <AdminDashboardSkeleton />;
  }
  
  const totalRevenueSum = analyticsData.dailySales.reduce((sum, item) => sum + (item.totalSales || 0), 0);
  
  const displayTotalOrders = analyticsData.totalOrdersCount !== undefined
    ? analyticsData.totalOrdersCount
    : analyticsData.dailySales.reduce((sum, item) => sum + item.orderCount, 0); 

  const totalOrdersLast7Days = analyticsData.dailySales.reduce((sum, item) => sum + item.orderCount, 0);
  const averageOrderValue = totalOrdersLast7Days > 0 ? (totalRevenueSum / totalOrdersLast7Days) : 0;


  const kpiData = [
    { title: "Total Revenue (Last 7 Days)", value: formatInr(totalRevenueSum), icon: IndianRupee, change: "+2.1% from last week" },
    { title: "Total Orders (All Time)", value: displayTotalOrders, icon: ShoppingBag, change: "+1.5% from last week" },
    { title: "New Customers (Placeholder)", value: "120", icon: Users, change: "+5.0% from last week" },
    { title: "Avg. Order Value (Last 7 Days)", value: formatInr(averageOrderValue), icon: TrendingUp, change: "+0.5% from last week" },
  ];


  return (
    <div className="space-y-8 p-1 animate-fade-in">
      <h1 className="text-3xl font-headline font-bold">Admin Dashboard</h1>
      {dashboardMessage && (
        <Alert variant="default" className="bg-primary/10 border-primary/30 text-primary">
          <Lightbulb className="h-4 w-4" />
          <AlertTitle>Developer Notice</AlertTitle>
          <AlertDescription>{dashboardMessage}</AlertDescription>
        </Alert>
      )}
      
      <section className="grid gap-6 md:grid-cols-1">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center">
              <Lightbulb className="mr-2 h-5 w-5 text-primary" />
              AI Insights
            </CardTitle>
            <CardDescription>Generative insights based on your restaurant's data.</CardDescription>
          </CardHeader>
          <CardContent>
            {isInsightsLoading && (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            )}
            {insightsError && !isInsightsLoading && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error Fetching Insights</AlertTitle>
                <AlertDescription>{insightsError}</AlertDescription>
              </Alert>
            )}
            {!isInsightsLoading && !insightsError && aiInsights && (
              <p className="text-muted-foreground whitespace-pre-line">{aiInsights}</p>
            )}
            {!isInsightsLoading && !insightsError && !aiInsights && (
              <p className="text-muted-foreground">No AI insights available at the moment. Check back later or ensure data is populated.</p>
            )}
          </CardContent>
        </Card>
      </section>


      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi, index) => (
          <Card key={index} className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              {kpi.change && (
                 <p className="text-xs text-muted-foreground pt-1">
                    {kpi.change}
                 </p>
              )}
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Daily Sales Overview</CardTitle>
            <CardDescription>Last 7 days sales performance.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.dailySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(tick) => {
                    try {
                      const [year, month, day] = String(tick).split('-').map(Number);
                      if (!year || !month || !day) return String(tick); 
                      return new Date(year, month - 1, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    } catch (e) {
                      return String(tick); 
                    }
                  }} 
                  stroke="hsl(var(--foreground))" 
                />
                <YAxis stroke="hsl(var(--foreground))" tickFormatter={(value) => formatInr(value)} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value: number, name: string) => name === "Sales (₹)" ? formatInr(value) : value}
                />
                <Legend />
                <Line type="monotone" dataKey="totalSales" name="Sales (₹)" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ r:4, fill: 'hsl(var(--chart-1))' }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="orderCount" name="Orders" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r:4, fill: 'hsl(var(--chart-2))' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Most Ordered Dishes</CardTitle>
            <CardDescription>Top 5 popular dishes by quantity sold.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.mostOrderedDishes.slice(0, 5)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--foreground))" />
                <YAxis dataKey="itemName" type="category" stroke="hsl(var(--foreground))" tick={false} width={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                  cursor={{fill: 'hsl(var(--muted))'}}
                />
                <Bar 
                  dataKey="quantitySold" 
                  name="Quantity Sold" 
                  activeBar={{ fill: 'hsl(var(--chart-bar-hover))' }}
                >
                    {analyticsData.mostOrderedDishes.slice(0,5).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>
      
      <section className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Category Revenue Breakdown</CardTitle>
            <CardDescription>Revenue distribution across menu categories.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={analyticsData.categoryRevenue}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={false} 
                  outerRadius={100} 
                  fill="hsl(var(--chart-1))"
                  dataKey="totalRevenue"
                  nameKey="categoryName"
                  activeShape={{ fill: 'hsl(var(--chart-bar-hover))' }}
                >
                  {analyticsData.categoryRevenue.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value: number, name: string) => [formatInr(value), name]}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Peak Ordering Hours</CardTitle>
            <CardDescription>Order volume by hour of the day.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
             <ResponsiveContainer width="100%" height={350}>
              <BarChart data={analyticsData.peakOrderingHours} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="hour" stroke="hsl(var(--foreground))" tickFormatter={(hour) => `${hour % 12 || 12} ${hour < 12 || hour === 24 ? 'AM' : 'PM'}`} />
                <YAxis stroke="hsl(var(--foreground))" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                  cursor={{fill: 'hsl(var(--muted))'}}
                  labelFormatter={(label) => {
                    const hour = parseInt(String(label), 10);
                    if (isNaN(hour)) return String(label); 
                    return `${hour % 12 || 12} ${hour < 12 || hour === 24 ? 'AM' : 'PM'}`;
                  }}
                />
                <Bar dataKey="orderCount" name="Number of Orders" fill="hsl(var(--chart-4))" activeBar={{ fill: 'hsl(var(--chart-bar-hover))' }} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

    </div>
  );
}


    
