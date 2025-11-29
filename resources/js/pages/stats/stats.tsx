import { SelectMonth } from '@/components/dates/select-month';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, XAxis } from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Stats',
        href: '/stats',
    },
];

interface CategoryStat {
    name: string;
    value: number;
}

interface DailyStat {
    date: string;
    day: string;
    amount: number;
}

interface StatsProps {
    filters: {
        date: string;
        type: 'income' | 'expense';
    };
    categoryStats: CategoryStat[];
    dailyStats: DailyStat[];
    mainCurrency: string;
}

// Predefined chart colors using Shadcn variables
const CHART_COLORS = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
];

const MAX_PIE_CATEGORIES = 5;

export default function Stats({ filters, categoryStats, dailyStats, mainCurrency }: StatsProps) {
    const [selectedMonth, setSelectedMonth] = useState<Date>(new Date(filters.date));
    const [activeTab, setActiveTab] = useState<string>(filters.type);

    // Sync local state with props when they change (e.g. browser back button)
    useEffect(() => {
        setSelectedMonth(new Date(filters.date));
        setActiveTab(filters.type);
    }, [filters]);

    const handleMonthChange = (date: Date) => {
        setSelectedMonth(date);
        updateParams(date, activeTab);
    };

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        updateParams(selectedMonth, value);
    };

    const updateParams = (date: Date, type: string) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const dateParam = `${year}-${month}-01`;

        router.get(
            '/stats',
            { date: dateParam, type },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    // Consolidate categories for pie chart - group smaller ones into "Other"
    const consolidatedCategoryData = useMemo(() => {
        if (categoryStats.length <= MAX_PIE_CATEGORIES) {
            return categoryStats;
        }

        // Sort by value descending and take top categories
        const sorted = [...categoryStats].sort((a, b) => b.value - a.value);
        const topCategories = sorted.slice(0, MAX_PIE_CATEGORIES - 1);
        const otherCategories = sorted.slice(MAX_PIE_CATEGORIES - 1);

        const otherTotal = otherCategories.reduce((sum, cat) => sum + cat.value, 0);

        return [
            ...topCategories,
            { name: 'Other', value: otherTotal },
        ];
    }, [categoryStats]);

    // --- Configuration for Category Chart ---
    const categoryChartConfig = useMemo(() => {
        const config: ChartConfig = {
            amount: { label: 'Amount' },
        };
        consolidatedCategoryData.forEach((stat, index) => {
            config[stat.name] = {
                label: stat.name,
                color: CHART_COLORS[index % CHART_COLORS.length],
            };
        });
        return config;
    }, [consolidatedCategoryData]);

    // Add fill color to data for Pie Chart
    const categoryChartData = useMemo(() => {
        return consolidatedCategoryData.map((stat, index) => ({
            ...stat,
            fill: CHART_COLORS[index % CHART_COLORS.length],
        }));
    }, [consolidatedCategoryData]);

    // --- Configuration for Daily Chart ---
    const dailyChartConfig = {
        amount: {
            label: 'Amount',
            color: 'var(--primary)', // Use primary color for the area chart
        },
    } satisfies ChartConfig;

    const totalAmount = useMemo(() => {
        return categoryStats.reduce((acc, curr) => acc + curr.value, 0);
    }, [categoryStats]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Stats" />

            <div className="space-y-6 p-4">
                {/* Header Controls */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full sm:w-auto">
                        <TabsList className="grid w-full grid-cols-2 sm:w-[200px]">
                            <TabsTrigger value="expense">Expense</TabsTrigger>
                            <TabsTrigger value="income">Income</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <SelectMonth selectedMonth={selectedMonth} onMonthSelect={handleMonthChange} />
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                    {/* Category Breakdown (Pie Chart) */}
                    <Card className="flex flex-col lg:col-span-3">
                        <CardHeader className="items-center pb-0">
                            <CardTitle>Category Breakdown</CardTitle>
                            <CardDescription>
                                {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 pb-0">
                            {categoryStats.length > 0 ? (
                                <ChartContainer config={categoryChartConfig} className="mx-auto aspect-square max-h-[300px]">
                                    <PieChart>
                                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                        <Pie
                                            data={categoryChartData}
                                            dataKey="value"
                                            nameKey="name"
                                            innerRadius={60}
                                            strokeWidth={5}
                                        >
                                            {categoryChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                        <ChartLegend content={<ChartLegendContent nameKey="name" />} className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center" />
                                    </PieChart>
                                </ChartContainer>
                            ) : (
                                <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                                    No data for this period
                                </div>
                            )}
                        </CardContent>
                        {categoryStats.length > 0 && (
                            <div className="flex items-center justify-center gap-2 p-4 pt-0 text-sm font-medium">
                                <span>Total:</span>
                                <span className="font-bold">{formatCurrency(totalAmount, mainCurrency)}</span>
                            </div>
                        )}
                    </Card>

                    {/* Daily Trend (Area Chart) */}
                    <Card className="flex flex-col lg:col-span-4">
                        <CardHeader>
                            <CardTitle>Daily Trend</CardTitle>
                            <CardDescription>
                                Daily transaction total for {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={dailyChartConfig} className="aspect-auto h-[300px] w-full">
                                <AreaChart
                                    accessibilityLayer
                                    data={dailyStats}
                                    margin={{
                                        left: 12,
                                        right: 12,
                                    }}
                                >
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="day"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                    />
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent indicator="line" labelFormatter={(value) => `${selectedMonth.toLocaleString('default', { month: 'short' })} ${value}`} />}
                                    />
                                    <Area
                                        dataKey="amount"
                                        type="natural"
                                        fill="var(--color-amount)"
                                        fillOpacity={0.4}
                                        stroke="var(--color-amount)"
                                    />
                                </AreaChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
