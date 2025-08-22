import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';

import CurrencySelect from '@/components/currency-select';
import { DatePicker } from '@/components/date-picker';
import InputError from '@/components/input-error';

import { type Account, type Category } from '@/types/models';
import { Form } from '@inertiajs/react';

interface CreateTransactionsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: Account[];
  categories: Category[];
}

export default function CreateTransactionsDrawer({ open, onOpenChange, accounts, categories }: CreateTransactionsDrawerProps) {
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');
  const [inputCurrency, setInputCurrency] = useState<string>('USD');
  const [date, setDate] = useState<Date>(new Date());

  const filteredCategories = categories.filter((category) => category.type === transactionType);

  const handleSuccess = () => {
    // Reset internal state and close drawer on success
    setTransactionType('expense');
    setInputCurrency('USD');
    setDate(new Date());
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <Form
          className="overflow-y-auto"
          method="post"
          action={route('transactions.store')}
          onSuccess={handleSuccess}
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
                  <Tabs value={transactionType} onValueChange={(value) => setTransactionType(value as 'income' | 'expense')}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="expense" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        Expense
                      </TabsTrigger>
                      <TabsTrigger value="income" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        Income
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <input type="hidden" name="type" value={transactionType} />
                </div>

                {/* Account Selection */}
                <div className="space-y-2">
                  <Label htmlFor="account_id">Account</Label>
                  <Select
                    onValueChange={(value) => {
                      const accountCurrency = accounts.find((account) => account.id.toString() === value)?.currency;
                      if (accountCurrency) {
                        setInputCurrency(accountCurrency);
                      }
                    }}
                    name="account_id"
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
                    <CurrencySelect
                      name="input_currency"
                      value={inputCurrency}
                      onValueChange={(value) => setInputCurrency(value)}
                      placeholder="Currency"
                      disabled={processing}
                      required
                    />
                    <InputError message={errors.input_currency} />
                  </div>
                </div>

                {/* Final Amount (for now, same as input amount) */}
                <input type="hidden" name="amount" />
                <input type="hidden" name="rate" value="1" />

                {/* Label */}
                <div className="space-y-2">
                  <Label htmlFor="label">Label (optional)</Label>
                  <Input id="label" name="label" placeholder="e.g. Grocery shopping, Salary payment" disabled={processing} />
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
  );
}


