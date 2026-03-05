import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useMemo } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Trends',
        href: '/trends',
    },
];

interface MonthlyData {
    month: string;
    income: number;
    expense: number;
    net: number;
}

interface TrendsProps {
    monthlyData: MonthlyData[];
    categoryMonthlyData: Record<string, string | number>[];
    categories: string[];
    mainCurrency: string;
    filters: {
        range: number;
    };
}

const CHART_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)', '#F6B1CE', '#A3D78A', '#8BB8E8'];

export default function Trends({ monthlyData, categoryMonthlyData, categories, mainCurrency, filters }: TrendsProps) {
    const handleRangeChange = (value: string) => {
        router.get('/trends', { range: value }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const hasData = monthlyData.some((d) => d.income > 0 || d.expense > 0);

    // Income vs Expenses chart config
    const incomeExpenseConfig = {
        income: { label: 'Income', color: '#A3D78A' },
        expense: { label: 'Expense', color: '#F6B1CE' },
    } satisfies ChartConfig;

    // Net savings chart config
    const netSavingsConfig = {
        net: { label: 'Net Savings', color: 'var(--chart-1)' },
    } satisfies ChartConfig;

    // Category chart config
    const categoryChartConfig = useMemo(() => {
        const config: ChartConfig = {};
        categories.forEach((cat, index) => {
            config[cat] = {
                label: cat,
                color: CHART_COLORS[index % CHART_COLORS.length],
            };
        });
        return config;
    }, [categories]);

    const currencyFormatter = (value: number) => formatCurrency(value, mainCurrency);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Trends" />

            <div className="space-y-6 p-4">
                {/* Sticky Range Toggle */}
                <div className="sticky top-0 z-10 bg-background/95 backdrop-blur">
                    <Tabs value={String(filters.range)} onValueChange={handleRangeChange} className="w-full sm:w-auto">
                        <TabsList className="grid w-full grid-cols-3 sm:w-[240px]">
                            <TabsTrigger value="3">3M</TabsTrigger>
                            <TabsTrigger value="6">6M</TabsTrigger>
                            <TabsTrigger value="12">12M</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {!hasData ? (
                    <Card>
                        <CardContent className="flex h-[300px] items-center justify-center">
                            <p className="text-muted-foreground">No data for this period</p>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {/* Section 1: Income vs Expenses */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Income vs Expenses</CardTitle>
                                <CardDescription>Monthly income and expense trends over {filters.range} months</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={incomeExpenseConfig} className="aspect-auto h-[300px] w-full">
                                    <AreaChart data={monthlyData} margin={{ left: 12, right: 12 }}>
                                        <CartesianGrid vertical={false} />
                                        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                                        <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => formatCurrency(v, mainCurrency)} width={80} />
                                        <ChartTooltip content={<ChartTooltipContent formatter={(value) => currencyFormatter(value as number)} />} />
                                        <Area type="monotone" dataKey="income" stroke="#A3D78A" fill="#A3D78A" fillOpacity={0.3} strokeWidth={2} />
                                        <Area type="monotone" dataKey="expense" stroke="#F6B1CE" fill="#F6B1CE" fillOpacity={0.3} strokeWidth={2} />
                                        <ChartLegend content={<ChartLegendContent />} />
                                    </AreaChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>

                        {/* Section 2: Net Savings */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Net Savings</CardTitle>
                                <CardDescription>Monthly income minus expenses</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={netSavingsConfig} className="aspect-auto h-[300px] w-full">
                                    <LineChart data={monthlyData} margin={{ left: 12, right: 12 }}>
                                        <CartesianGrid vertical={false} />
                                        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                                        <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => formatCurrency(v, mainCurrency)} width={80} />
                                        <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                                        <ChartTooltip content={<ChartTooltipContent formatter={(value) => currencyFormatter(value as number)} />} />
                                        <Line
                                            type="monotone"
                                            dataKey="net"
                                            stroke="var(--color-net)"
                                            strokeWidth={2}
                                            dot={{ r: 4 }}
                                            activeDot={{ r: 6 }}
                                        />
                                    </LineChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>

                        {/* Section 3: Expense Categories Over Time */}
                        {categories.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Expense Categories Over Time</CardTitle>
                                    <CardDescription>Monthly expense breakdown by category</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ChartContainer config={categoryChartConfig} className="aspect-auto h-[350px] w-full">
                                        <BarChart data={categoryMonthlyData} margin={{ left: 12, right: 12 }}>
                                            <CartesianGrid vertical={false} />
                                            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                                            <YAxis
                                                tickLine={false}
                                                axisLine={false}
                                                tickFormatter={(v) => formatCurrency(v, mainCurrency)}
                                                width={80}
                                            />
                                            <ChartTooltip
                                                content={
                                                    <ChartTooltipContent
                                                        formatter={(value, name) => [currencyFormatter(value as number), ` - ${name}`]}
                                                    />
                                                }
                                            />
                                            {categories.map((cat, index) => (
                                                <Bar
                                                    key={cat}
                                                    dataKey={cat}
                                                    stackId="a"
                                                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                                                    radius={index === categories.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                                                />
                                            ))}
                                            <ChartLegend content={<ChartLegendContent />} />
                                        </BarChart>
                                    </ChartContainer>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}
            </div>
        </AppLayout>
    );
}
