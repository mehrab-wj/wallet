import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { type Transaction } from '@/types/models';
import { Form } from '@inertiajs/react';
import { Edit, Trash2, TrendingDown, TrendingUp } from 'lucide-react';

interface TransactionItemProps {
    transaction: Transaction;
    onEdit: (transaction: Transaction) => void;
    formatCurrency: (amount: number) => string;
    formatDate: (dateString: string) => string;
}

export function TransactionItem({ transaction, onEdit, formatCurrency, formatDate }: TransactionItemProps) {
    return (
        <div key={transaction.id} className="flex items-center justify-between rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50">
            <div className="flex items-center space-x-3">
                <div
                    className={`rounded-full p-2 ${transaction.type === 'income' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`}
                >
                    {transaction.type === 'income' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                    <div className="flex items-center space-x-2">
                        <p className="font-medium">{transaction.category?.name}</p>
                        {transaction.label && <span className="rounded bg-muted px-2 py-1 text-xs text-muted-foreground">{transaction.label}</span>}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>{transaction.account?.name}</span>
                        <span>•</span>
                        <span>{formatDate(transaction.transaction_date)}</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center space-x-3">
                <div className="text-right">
                    <p
                        className={`font-semibold ${transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                    >
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                    </p>
                    {transaction.input_currency !== 'USD' && (
                        <p className="text-xs text-muted-foreground">
                            {formatCurrency(transaction.input_amount)} {transaction.input_currency}
                        </p>
                    )}
                </div>
                <div className="flex space-x-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(transaction)}>
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogTitle>Delete transaction?</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete "{transaction.label || 'this transaction'}"? This action cannot be undone.
                            </DialogDescription>

                            <Form method="delete" action={route('transactions.destroy', transaction.id)} options={{ preserveScroll: true }}>
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
        </div>
    );
}
