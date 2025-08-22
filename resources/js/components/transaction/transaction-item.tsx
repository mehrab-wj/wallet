import { formatCurrency } from '@/lib/utils';
import { type Transaction } from '@/types/models';
import { TrendingDown, TrendingUp } from 'lucide-react';

interface TransactionItemProps {
    transaction: Transaction;
    onEdit: (transaction: Transaction) => void;
}

export function TransactionItem({ transaction, onEdit }: TransactionItemProps) {
    return (
        <div
            key={transaction.id}
            className={`relative flex items-center justify-between rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50`}
            onClick={() => onEdit(transaction)}
        >
            <div className="flex items-center space-x-3">
                <div
                    className={`block rounded-full p-2 ${transaction.type === 'income' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`}
                >
                    {transaction.type === 'income' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                </div>
                <div className="flex flex-col">
                    <div className="flex items-center space-x-2">
                        <p className="font-medium">{transaction.category?.name}</p>
                        {transaction.label && <span className="rounded bg-muted px-2 py-1 text-xs text-muted-foreground">{transaction.label}</span>}
                    </div>

                    <div className="flex flex-col space-x-2 text-sm text-muted-foreground sm:flex-row sm:items-center">
                        <span>{transaction.account?.name}</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center space-x-3">
                <div className="text-right">
                    <p
                        className={`font-semibold ${transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                    >
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(transaction.amount, transaction.account?.currency)}
                    </p>

                    {transaction.input_currency !== transaction.account?.currency && (
                        <p className="text-xs text-muted-foreground">{formatCurrency(transaction.input_amount, transaction.input_currency)}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
