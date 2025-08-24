import { Form, Head } from '@inertiajs/react';
import { Calendar, Clock, DollarSign, Edit, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import Heading from '@/components/heading';
import CreateSubscriptionDrawer from '@/components/subscription/create-subscription-drawer';
import EditSubscriptionDrawer from '@/components/subscription/edit-subscription-drawer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import type { Account, Category, Subscription } from '@/types/models';

interface SubscriptionsProps {
    subscriptions: Subscription[];
    accounts: Account[];
    expenseCategories: Category[];
}

export default function Subscriptions({ subscriptions, accounts, expenseCategories }: SubscriptionsProps) {
    const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
    const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);

    const handleEdit = (subscription: Subscription) => {
        setEditingSubscription(subscription);
        setIsEditDrawerOpen(true);
    };

    const resetEditDrawer = () => {
        setIsEditDrawerOpen(false);
        setEditingSubscription(null);
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getIntervalLabel = (unit: string) => {
        const labels = {
            day: 'Daily',
            week: 'Weekly',
            month: 'Monthly',
            year: 'Yearly',
        };
        return labels[unit as keyof typeof labels] || unit;
    };

    const getStatusColor = (subscription: Subscription) => {
        if (!subscription.active) return 'secondary';

        const nextRun = new Date(subscription.next_run_on);
        const today = new Date();
        const diffDays = Math.ceil((nextRun.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'destructive'; // Overdue
        if (diffDays <= 3) return 'default'; // Due soon
        return 'secondary'; // Future
    };

    const getStatusLabel = (subscription: Subscription) => {
        if (!subscription.active) return 'Inactive';

        const nextRun = new Date(subscription.next_run_on);
        const today = new Date();
        const diffDays = Math.ceil((nextRun.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'Overdue';
        if (diffDays === 0) return 'Due Today';
        if (diffDays <= 3) return 'Due Soon';
        return 'Active';
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Subscriptions', href: '/subscriptions' },
            ]}
        >
            <Head title="Subscriptions" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading title="Subscriptions" />
                    <Button onClick={() => setIsCreateDrawerOpen(true)}>
                        <Plus className="h-4 w-4" />
                        Add Subscription
                    </Button>
                </div>

                {subscriptions.length === 0 && (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
                            <CardTitle className="mb-2 text-center">No subscriptions yet</CardTitle>
                            <CardDescription className="mb-4 text-center">
                                Add your first subscription to track recurring expenses automatically
                            </CardDescription>
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {subscriptions.map((subscription) => (
                        <Card key={subscription.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-lg">{subscription.vendor}</CardTitle>
                                        <CardDescription className="mt-1 flex items-center gap-2">
                                            <DollarSign className="h-3 w-3" />
                                            {formatCurrency(subscription.input_amount, subscription.input_currency)}
                                            <span className="text-xs">• {getIntervalLabel(subscription.interval_unit)}</span>
                                        </CardDescription>
                                    </div>

                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(subscription)} className="h-8 w-8">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogTitle>Delete subscription?</DialogTitle>
                                                <DialogDescription>
                                                    Are you sure you want to delete the "{subscription.vendor}" subscription? This action cannot be
                                                    undone.
                                                </DialogDescription>

                                                <Form
                                                    method="delete"
                                                    action={route('subscriptions.destroy', subscription.id)}
                                                    options={{ preserveScroll: true }}
                                                >
                                                    {({ processing }) => (
                                                        <DialogFooter className="gap-2">
                                                            <DialogClose asChild>
                                                                <Button variant="secondary" disabled={processing}>
                                                                    Cancel
                                                                </Button>
                                                            </DialogClose>
                                                            <Button variant="destructive" disabled={processing} asChild>
                                                                <button type="submit">Delete</button>
                                                            </Button>
                                                        </DialogFooter>
                                                    )}
                                                </Form>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Badge variant={getStatusColor(subscription)}>{getStatusLabel(subscription)}</Badge>
                                        <span className="text-sm text-muted-foreground">{subscription.category?.name}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        Next: {formatDate(subscription.next_run_on)}
                                    </div>

                                    {subscription.description && (
                                        <p className="line-clamp-2 text-sm text-muted-foreground">{subscription.description}</p>
                                    )}

                                    <div className="text-xs text-muted-foreground">Account: {subscription.account?.name}</div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                                 {/* Create Subscription Drawer */}
                 <CreateSubscriptionDrawer 
                     open={isCreateDrawerOpen}
                     onOpenChange={setIsCreateDrawerOpen}
                     accounts={accounts}
                     expenseCategories={expenseCategories}
                 />

                 {/* Edit Subscription Drawer */}
                 <EditSubscriptionDrawer
                     open={isEditDrawerOpen}
                     onOpenChange={setIsEditDrawerOpen}
                     accounts={accounts}
                     expenseCategories={expenseCategories}
                     subscription={editingSubscription}
                     onSuccess={resetEditDrawer}
                 />
            </div>
        </AppLayout>
    );
}
