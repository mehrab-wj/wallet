import { Form, Head } from '@inertiajs/react';
import { Edit, Plus, Trash2, Wallet } from 'lucide-react';
import { useState } from 'react';

import CreateBudgetDrawer from '@/components/budget/create-budget-drawer';
import EditBudgetDrawer from '@/components/budget/edit-budget-drawer';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import type { Budget, Category } from '@/types/models';

interface BudgetsProps {
    budgets: Budget[];
    expenseCategories: Category[];
}

export default function Budgets({ budgets, expenseCategories }: BudgetsProps) {
    const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
    const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

    const handleEdit = (budget: Budget) => {
        setEditingBudget(budget);
        setIsEditDrawerOpen(true);
    };

    const resetEditDrawer = () => {
        setIsEditDrawerOpen(false);
        setEditingBudget(null);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const getBudgetProgress = (budget: Budget) => {
        if (!budget.allocated || budget.allocated === 0) return 0;
        return Math.min(((budget.spent || 0) / budget.allocated) * 100, 100);
    };

    const getBudgetStatusColor = (budget: Budget) => {
        const progress = getBudgetProgress(budget);
        if (!budget.active) return 'secondary';
        if (progress >= 100) return 'destructive';
        if (progress >= 75) return 'default';
        return 'secondary';
    };

    const getBudgetStatusLabel = (budget: Budget) => {
        if (!budget.active) return 'Inactive';
        const progress = getBudgetProgress(budget);
        if (progress >= 100) return 'Exceeded';
        if (progress >= 75) return 'Near Limit';
        return 'On Track';
    };

    const getProgressBarColor = (budget: Budget) => {
        const progress = getBudgetProgress(budget);
        if (progress >= 100) return 'bg-red-500';
        if (progress >= 75) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Budgets', href: '/budgets' },
            ]}
        >
            <Head title="Budgets" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading title="Budgets" />
                    <Button onClick={() => setIsCreateDrawerOpen(true)}>
                        <Plus className="h-4 w-4" />
                        Create Budget
                    </Button>
                </div>

                {budgets.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Wallet className="mb-4 h-12 w-12 text-muted-foreground" />
                            <p className="text-center text-muted-foreground">
                                No budgets yet. Create your first budget to start tracking your expenses.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {budgets.map((budget) => (
                            <Card key={budget.id} className="relative">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-lg">{budget.name}</CardTitle>
                                            <CardDescription>
                                                {budget.amount_type === 'fixed'
                                                    ? `Fixed ${formatCurrency(budget.amount_value)}`
                                                    : `${Math.floor(budget.amount_value)}% of income`}
                                            </CardDescription>
                                        </div>
                                        <Badge variant={getBudgetStatusColor(budget)}>{getBudgetStatusLabel(budget)}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Budget Progress */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Spent</span>
                                            <span className="font-medium">
                                                {formatCurrency(budget.spent || 0)} / {formatCurrency(budget.allocated || 0)}
                                            </span>
                                        </div>
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                                            <div
                                                className={`h-full transition-all ${getProgressBarColor(budget)}`}
                                                style={{ width: `${getBudgetProgress(budget)}%` }}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Remaining</span>
                                            <span className={`font-medium ${(budget.remaining || 0) < 0 ? 'text-red-500' : ''}`}>
                                                {formatCurrency(budget.remaining || 0)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Categories */}
                                    {budget.categories && budget.categories.length > 0 && (
                                        <div>
                                            <p className="mb-2 text-sm font-medium">Categories</p>
                                            <div className="flex flex-wrap gap-1">
                                                {budget.categories.map((category) => (
                                                    <Badge key={category.id} variant="outline" className="text-xs">
                                                        {category.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-2">
                                        <Button variant="outline" size="sm" onClick={() => handleEdit(budget)} className="flex-1">
                                            <Edit className="h-4 w-4" />
                                            Edit
                                        </Button>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogTitle>Delete Budget</DialogTitle>
                                                <DialogDescription>
                                                    Are you sure you want to delete "{budget.name}"? This action cannot be undone.
                                                </DialogDescription>
                                                <DialogFooter>
                                                    <DialogClose asChild>
                                                        <Button variant="outline">Cancel</Button>
                                                    </DialogClose>
                                                    <Form action={`/budgets/${budget.id}`} method="delete">
                                                        <Button type="submit" variant="destructive">
                                                            Delete
                                                        </Button>
                                                    </Form>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <CreateBudgetDrawer open={isCreateDrawerOpen} onOpenChange={setIsCreateDrawerOpen} expenseCategories={expenseCategories} />

            {editingBudget && (
                <EditBudgetDrawer
                    open={isEditDrawerOpen}
                    onOpenChange={resetEditDrawer}
                    budget={editingBudget}
                    expenseCategories={expenseCategories}
                />
            )}
        </AppLayout>
    );
}
