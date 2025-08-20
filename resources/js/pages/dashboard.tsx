import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export interface DashboardData {
    income: number;
    expense: number;
    total: number;
}

export default function Dashboard() {
    const { props } = usePage<{ dashboardData: DashboardData }>();
    const { income = 0, expense = 0, total = 0 } = props.dashboardData || {};

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="">
                        <Card>
                            <CardHeader>
                                <CardDescription>Income</CardDescription>
                                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{formatCurrency(income)}</CardTitle>
                            </CardHeader>
                        </Card>
                    </div>
                    <div className="">
                        <Card>
                            <CardHeader>
                                <CardDescription>Expense</CardDescription>
                                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                                    {formatCurrency(expense)}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                    </div>
                    <div className="">
                        <Card>
                            <CardHeader>
                                <CardDescription>Total</CardDescription>
                                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{formatCurrency(total)}</CardTitle>
                            </CardHeader>
                        </Card>
                    </div>
                </div>
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                </div>
            </div>
        </AppLayout>
    );
}
