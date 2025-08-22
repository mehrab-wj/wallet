import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 
import { useState } from 'react';

 
import { Plus } from 'lucide-react';

 
import { TransactionItem } from '@/components/transaction/transaction-item';
import CreateTransactionsDrawer from '@/components/transaction/create-transaction-drawer';
import EditTransactionDrawer from '@/components/transaction/edit-transaction-drawer';
import { DateSeparator } from '@/components/date-separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type Account, type Category, type Transaction } from '@/types/models';
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
    

    const handleEdit = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setIsEditDrawerOpen(true);
    };

    

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
                    <div className="space-y-3 pb-18">
                        {(() => {
                            // Initialize with today's date in YYYY-MM-DD format
                            let currentDate = new Date().toISOString().split('T')[0];
                            
                            return transactions.map((transaction) => {
                                const showSeparator = transaction.transaction_date !== currentDate;
                                
                                if (showSeparator) {
                                    currentDate = transaction.transaction_date;
                                }
                                
                                return (
                                    <div key={transaction.id}>
                                        {showSeparator && (
                                            <DateSeparator date={transaction.transaction_date} />
                                        )}
                                        <TransactionItem
                                            transaction={transaction}
                                            onEdit={handleEdit}
                                            formatCurrency={formatCurrency}
                                        />
                                    </div>
                                );
                            });
                        })()}
                    </div>
                )}

                {/* Floating Action Button */}
                <Button className="fixed right-6 bottom-6 h-14 w-14 rounded-full shadow-lg" size="icon" onClick={() => setIsCreateDrawerOpen(true)}>
                    <Plus className="h-6 w-6" />
                </Button>

                {/* Create Transaction Drawer */}
                <CreateTransactionsDrawer
                    open={isCreateDrawerOpen}
                    onOpenChange={setIsCreateDrawerOpen}
                    accounts={accounts}
                    categories={categories}
                />

                {/* Edit Transaction Drawer */}
                <EditTransactionDrawer
                    open={isEditDrawerOpen}
                    onOpenChange={setIsEditDrawerOpen}
                    accounts={accounts}
                    categories={categories}
                    transaction={editingTransaction}
                    onSuccess={() => {
                        setEditingTransaction(null);
                        setIsEditDrawerOpen(false);
                    }}
                />
            </div>
        </AppLayout>
    );
}
