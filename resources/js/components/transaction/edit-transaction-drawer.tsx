import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import CurrencySelect from '@/components/currency-select';
import { DatePicker } from '@/components/dates/date-picker';
import InputError from '@/components/input-error';

import { type Account, type Category, type Transaction } from '@/types/models';
import { Form } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';

interface EditTransactionDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    accounts: Account[];
    categories: Category[];
    transaction: Transaction | null;
    onSuccess: () => void;
}

export default function EditTransactionDrawer({ open, onOpenChange, accounts, categories, transaction, onSuccess }: EditTransactionDrawerProps) {
    const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');
    const [inputCurrency, setInputCurrency] = useState<string>('USD');
    const [date, setDate] = useState<Date>(new Date());

    useEffect(() => {
        if (transaction) {
            setTransactionType(transaction.type);
            setInputCurrency(transaction.input_currency);
            setDate(new Date(transaction.transaction_date));
        }
    }, [transaction]);

    const filteredCategories = categories.filter((category) => category.type === transactionType);

    const handleSuccess = () => {
        onSuccess();
    };

    if (!transaction) {
        return null;
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent>
                <div className="overflow-y-auto">
                    <Form method="put" action={route('transactions.update', transaction.id)} onSuccess={handleSuccess}>
                        {({ processing, errors }) => (
                            <>
                                <DrawerHeader>
                                    <DrawerTitle>Edit Transaction</DrawerTitle>
                                    <DrawerDescription>Update transaction details</DrawerDescription>
                                </DrawerHeader>

                                <div className="space-y-4 px-4">
                                    {/* Transaction Type Tabs */}
                                    <div className="space-y-2">
                                        <Tabs value={transactionType} onValueChange={(value) => setTransactionType(value as 'income' | 'expense')}>
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
                                            onValueChange={(value) => {
                                                const accountCurrency = accounts.find((account) => account.id.toString() === value)?.currency;
                                                if (accountCurrency) {
                                                    setInputCurrency(accountCurrency);
                                                }
                                            }}
                                            name="account_id"
                                            defaultValue={transaction.account_id.toString()}
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
                                        <Select name="category_id" defaultValue={transaction.category_id.toString()} required disabled={processing}>
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
                                                defaultValue={transaction.input_amount}
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
                                                value={inputCurrency}
                                                onValueChange={(value) => setInputCurrency(value)}
                                                placeholder="Select currency..."
                                                disabled={processing}
                                                required
                                            />
                                            <InputError message={errors.input_currency} />
                                        </div>
                                    </div>

                                    {/* Final Amount (for now, same as input amount) */}
                                    <input type="hidden" name="amount" defaultValue={transaction.amount} />
                                    <input type="hidden" name="rate" defaultValue={transaction.rate || 1} />

                                    {/* Label */}
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-label">Label (optional)</Label>
                                        <Input
                                            id="edit-label"
                                            name="label"
                                            defaultValue={transaction.label || ''}
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
                                            defaultValue={transaction.description || ''}
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
                                    {/* <DrawerClose asChild>
                                        <Button variant="outline" disabled={processing}>
                                            Cancel
                                        </Button>
                                    </DrawerClose> */}
                                </DrawerFooter>
                            </>
                        )}
                    </Form>

                    <Dialog>
                        <DialogTrigger asChild>
                            <div className="mb-4 w-full px-4">
                                <Button variant="ghost" className="w-full text-destructive hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                </Button>
                            </div>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogTitle>Delete transaction?</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete "{transaction.label || 'this transaction'}"? This action cannot be undone.
                            </DialogDescription>

                            <Form
                                method="delete"
                                action={route('transactions.destroy', transaction.id)}
                                onSuccess={() => onOpenChange(false)}
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
            </DrawerContent>
        </Drawer>
    );
}
