import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';

import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Plus } from 'lucide-react';

import CurrencySelect from '@/components/currency-select';
import { DatePicker } from '@/components/date-picker';
import InputError from '@/components/input-error';
import { TransactionItem } from '@/components/transaction-item';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type Account, type Category, type Transaction } from '@/types/models';
import { Form, Head, usePage } from '@inertiajs/react';

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

interface DashboardProps {
    dashboardData: DashboardData;
    transactions: Transaction[];
    accounts: Account[];
    categories: Category[];
    [key: string]: unknown;
}

export default function Dashboard() {
    const { props } = usePage<DashboardProps>();
    const { dashboardData, transactions, accounts, categories } = props;
    const { income = 0, expense = 0, total = 0 } = dashboardData || {};

    const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [date, setDate] = useState<Date>(new Date());
    const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');

    const handleEdit = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setTransactionType(transaction.type);
        setDate(new Date(transaction.transaction_date));
        setIsEditDrawerOpen(true);
    };

    const resetCreateDrawer = () => {
        setIsCreateDrawerOpen(false);
        setTransactionType('expense');
    };

    const resetEditDrawer = () => {
        setIsEditDrawerOpen(false);
        setEditingTransaction(null);
        setTransactionType('expense');
    };

    // Filter categories based on transaction type
    const filteredCategories = categories.filter((category) => category.type === transactionType);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Stats Cards */}
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

                {/* Recent Transactions */}
                {transactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="mb-4 rounded-full bg-muted p-3">
                            <Plus className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold">No transactions yet</h3>
                        <p className="mb-4 text-muted-foreground">Start tracking your finances by adding your first transaction</p>
                        <Button onClick={() => setIsCreateDrawerOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Transaction
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {transactions.map((transaction) => (
                            <TransactionItem
                                key={transaction.id}
                                transaction={transaction}
                                onEdit={handleEdit}
                                formatCurrency={formatCurrency}
                                formatDate={formatDate}
                            />
                        ))}
                    </div>
                )}

                {/* Floating Action Button */}
                <Button className="fixed right-6 bottom-6 h-14 w-14 rounded-full shadow-lg" size="icon" onClick={() => setIsCreateDrawerOpen(true)}>
                    <Plus className="h-6 w-6" />
                </Button>

                {/* Create Transaction Drawer */}
                <Drawer open={isCreateDrawerOpen} onOpenChange={setIsCreateDrawerOpen}>
                    <DrawerContent>
                        <Form
                            className="overflow-y-auto"
                            method="post"
                            action={route('transactions.store')}
                            onSuccess={resetCreateDrawer}
                            resetOnSuccess
                        >
                            {({ processing, errors }) => (
                                <>
                                    <DrawerHeader>
                                        <DrawerTitle>Add New Transaction</DrawerTitle>
                                        <DrawerDescription>Record a new income or expense transaction</DrawerDescription>
                                    </DrawerHeader>

                                    <div className="space-y-4 px-4">
                                        {/* Transaction Type Tabs */}
                                        <div className="space-y-2">
                                            <Tabs
                                                value={transactionType}
                                                onValueChange={(value) => setTransactionType(value as 'income' | 'expense')}
                                            >
                                                <TabsList className="grid w-full grid-cols-2">
                                                    <TabsTrigger
                                                        value="expense"
                                                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                                    >
                                                        Expense
                                                    </TabsTrigger>
                                                    <TabsTrigger
                                                        value="income"
                                                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                                    >
                                                        Income
                                                    </TabsTrigger>
                                                </TabsList>
                                            </Tabs>
                                            <input type="hidden" name="type" value={transactionType} />
                                        </div>

                                        {/* Account Selection */}
                                        <div className="space-y-2">
                                            <Label htmlFor="account_id">Account</Label>
                                            <Select name="account_id" required disabled={processing}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select account..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {accounts.map((account) => (
                                                        <SelectItem key={account.id} value={account.id.toString()}>
                                                            {account.name} ({account.currency})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.account_id} />
                                        </div>

                                        {/* Category Selection */}
                                        <div className="space-y-2">
                                            <Label htmlFor="category_id">Category</Label>
                                            <Select name="category_id" required disabled={processing}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select category..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {filteredCategories.map((category) => (
                                                        <SelectItem key={category.id} value={category.id.toString()}>
                                                            {category.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.category_id} />
                                        </div>

                                        {/* Amount and Currency */}
                                        <div className="grid grid-cols-5 gap-4">
                                            <div className="col-span-3 space-y-2">
                                                <Label htmlFor="input_amount">Amount</Label>
                                                <Input
                                                    id="input_amount"
                                                    name="input_amount"
                                                    type="number"
                                                    step="0.01"
                                                    min="0.01"
                                                    placeholder="0.00"
                                                    required
                                                    disabled={processing}
                                                />
                                                <InputError message={errors.input_amount} />
                                            </div>
                                            <div className="col-span-2 space-y-2">
                                                <Label htmlFor="input_currency">Currency</Label>
                                                <CurrencySelect name="input_currency" placeholder="Currency" disabled={processing} required />
                                                <InputError message={errors.input_currency} />
                                            </div>
                                        </div>

                                        {/* Final Amount (for now, same as input amount) */}
                                        <input type="hidden" name="amount" />
                                        <input type="hidden" name="rate" value="1" />

                                        {/* Label */}
                                        <div className="space-y-2">
                                            <Label htmlFor="label">Label (optional)</Label>
                                            <Input
                                                id="label"
                                                name="label"
                                                placeholder="e.g. Grocery shopping, Salary payment"
                                                disabled={processing}
                                            />
                                            <InputError message={errors.label} />
                                        </div>

                                        {/* Description */}
                                        <div className="space-y-2">
                                            <Label htmlFor="description">Description (optional)</Label>
                                            <textarea
                                                id="description"
                                                name="description"
                                                placeholder="Additional details about this transaction..."
                                                disabled={processing}
                                                rows={3}
                                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                            />
                                            <InputError message={errors.description} />
                                        </div>

                                        {/* Transaction Date */}
                                        <div className="space-y-2">
                                            <DatePicker date={date} setDate={setDate} />
                                            <input type="hidden" name="transaction_date" value={date.toLocaleDateString()} />
                                            <InputError message={errors.transaction_date} />
                                        </div>
                                    </div>

                                    <DrawerFooter>
                                        <Button type="submit" disabled={processing}>
                                            {processing ? 'Adding...' : 'Add Transaction'}
                                        </Button>
                                        <DrawerClose asChild>
                                            <Button variant="outline" disabled={processing}>
                                                Cancel
                                            </Button>
                                        </DrawerClose>
                                    </DrawerFooter>
                                </>
                            )}
                        </Form>
                    </DrawerContent>
                </Drawer>

                {/* Edit Transaction Drawer */}
                <Drawer open={isEditDrawerOpen} onOpenChange={setIsEditDrawerOpen}>
                    <DrawerContent>
                        {editingTransaction && (
                            <Form
                                className="overflow-y-auto"
                                method="put"
                                action={route('transactions.update', editingTransaction.id)}
                                onSuccess={resetEditDrawer}
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <DrawerHeader>
                                            <DrawerTitle>Edit Transaction</DrawerTitle>
                                            <DrawerDescription>Update transaction details</DrawerDescription>
                                        </DrawerHeader>

                                        <div className="space-y-4 px-4">
                                            {/* Transaction Type Tabs */}
                                            <div className="space-y-2">
                                                <Tabs
                                                    value={transactionType}
                                                    onValueChange={(value) => setTransactionType(value as 'income' | 'expense')}
                                                >
                                                    <TabsList className="grid w-full grid-cols-2">
                                                        <TabsTrigger
                                                            value="expense"
                                                            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                                        >
                                                            Expense
                                                        </TabsTrigger>
                                                        <TabsTrigger
                                                            value="income"
                                                            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                                        >
                                                            Income
                                                        </TabsTrigger>
                                                    </TabsList>
                                                </Tabs>
                                                <input type="hidden" name="type" value={transactionType} />
                                            </div>

                                            {/* Account Selection */}
                                            <div className="space-y-2">
                                                <Label htmlFor="edit-account_id">Account</Label>
                                                <Select
                                                    name="account_id"
                                                    defaultValue={editingTransaction.account_id.toString()}
                                                    required
                                                    disabled={processing}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select account..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {accounts.map((account) => (
                                                            <SelectItem key={account.id} value={account.id.toString()}>
                                                                {account.name} ({account.currency})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <InputError message={errors.account_id} />
                                            </div>

                                            {/* Category Selection */}
                                            <div className="space-y-2">
                                                <Label htmlFor="edit-category_id">Category</Label>
                                                <Select
                                                    name="category_id"
                                                    defaultValue={editingTransaction.category_id.toString()}
                                                    required
                                                    disabled={processing}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select category..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {filteredCategories.map((category) => (
                                                            <SelectItem key={category.id} value={category.id.toString()}>
                                                                {category.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <InputError message={errors.category_id} />
                                            </div>

                                            {/* Amount and Currency */}
                                            <div className="grid grid-cols-5 gap-4">
                                                <div className="col-span-3 space-y-2">
                                                    <Label htmlFor="edit-input_amount">Amount</Label>
                                                    <Input
                                                        id="edit-input_amount"
                                                        name="input_amount"
                                                        type="number"
                                                        step="0.01"
                                                        min="0.01"
                                                        defaultValue={editingTransaction.input_amount}
                                                        placeholder="0.00"
                                                        required
                                                        disabled={processing}
                                                    />
                                                    <InputError message={errors.input_amount} />
                                                </div>
                                                <div className="col-span-2 space-y-2">
                                                    <Label htmlFor="edit-input_currency">Currency</Label>
                                                    <CurrencySelect
                                                        name="input_currency"
                                                        value={editingTransaction.input_currency}
                                                        placeholder="Select currency..."
                                                        disabled={processing}
                                                        required
                                                    />
                                                    <InputError message={errors.input_currency} />
                                                </div>
                                            </div>

                                            {/* Final Amount (for now, same as input amount) */}
                                            <input type="hidden" name="amount" defaultValue={editingTransaction.amount} />
                                            <input type="hidden" name="rate" defaultValue={editingTransaction.rate || 1} />

                                            {/* Label */}
                                            <div className="space-y-2">
                                                <Label htmlFor="edit-label">Label (optional)</Label>
                                                <Input
                                                    id="edit-label"
                                                    name="label"
                                                    defaultValue={editingTransaction.label || ''}
                                                    placeholder="e.g. Grocery shopping, Salary payment"
                                                    disabled={processing}
                                                />
                                                <InputError message={errors.label} />
                                            </div>

                                            {/* Description */}
                                            <div className="space-y-2">
                                                <Label htmlFor="edit-description">Description (optional)</Label>
                                                <textarea
                                                    id="edit-description"
                                                    name="description"
                                                    defaultValue={editingTransaction.description || ''}
                                                    placeholder="Additional details about this transaction..."
                                                    disabled={processing}
                                                    rows={3}
                                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                                />
                                                <InputError message={errors.description} />
                                            </div>

                                            {/* Transaction Date */}
                                            <div className="space-y-2">
                                                <DatePicker date={date} setDate={setDate} />
                                                <input type="hidden" name="transaction_date" value={date.toLocaleDateString()} />
                                                <InputError message={errors.transaction_date} />
                                            </div>
                                        </div>

                                        <DrawerFooter>
                                            <Button type="submit" disabled={processing}>
                                                {processing ? 'Updating...' : 'Update Transaction'}
                                            </Button>
                                            <DrawerClose asChild>
                                                <Button variant="outline" disabled={processing}>
                                                    Cancel
                                                </Button>
                                            </DrawerClose>
                                        </DrawerFooter>
                                    </>
                                )}
                            </Form>
                        )}
                    </DrawerContent>
                </Drawer>
            </div>
        </AppLayout>
    );
}
