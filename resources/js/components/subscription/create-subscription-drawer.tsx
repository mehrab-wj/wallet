import { Form } from '@inertiajs/react';
import { useState } from 'react';

import CurrencySelect from '@/components/currency-select';
import { DatePicker } from '@/components/dates/date-picker';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

import type { Account, Category } from '@/types/models';

interface CreateSubscriptionDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    accounts: Account[];
    expenseCategories: Category[];
}

export default function CreateSubscriptionDrawer({ open, onOpenChange, accounts, expenseCategories }: CreateSubscriptionDrawerProps) {
    const [startDate, setStartDate] = useState<Date>(new Date());
    const [inputCurrency, setInputCurrency] = useState<string>('USD');
    const [isActive, setIsActive] = useState<boolean>(true);

    const handleSuccess = () => {
        // Reset state and close drawer
        setStartDate(new Date());
        setInputCurrency('USD');
        setIsActive(true);
        onOpenChange(false);
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent>
                <Form className="overflow-y-auto" method="post" action={route('subscriptions.store')} onSuccess={handleSuccess} resetOnSuccess>
                    {({ processing, errors }) => (
                        <>
                            <DrawerHeader>
                                <DrawerTitle>Add New Subscription</DrawerTitle>
                                <DrawerDescription>Set up a recurring subscription to automatically track expenses</DrawerDescription>
                            </DrawerHeader>

                            <div className="space-y-4 px-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="vendor">Vendor/Service Name</Label>
                                        <Input id="vendor" name="vendor" placeholder="e.g. Netflix, Spotify, Adobe" required disabled={processing} />
                                        <InputError message={errors.vendor} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="account_id">Account</Label>
                                        <Select
                                            name="account_id"
                                            onValueChange={(value) => {
                                                const accountCurrency = accounts.find((account) => account.id.toString() === value)?.currency;
                                                if (accountCurrency) {
                                                    setInputCurrency(accountCurrency);
                                                }
                                            }}
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
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category_id">Category</Label>
                                    <Select name="category_id" required disabled={processing}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select expense category..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {expenseCategories.map((category) => (
                                                <SelectItem key={category.id} value={category.id.toString()}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.category_id} />
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
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

                                    <div className="space-y-2">
                                        <Label htmlFor="input_currency">Currency</Label>
                                        <CurrencySelect
                                            name="input_currency"
                                            value={inputCurrency}
                                            onValueChange={(value) => setInputCurrency(value)}
                                            placeholder="Select currency..."
                                            required
                                            disabled={processing}
                                        />
                                        <InputError message={errors.input_currency} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="starts_on">Start Date</Label>
                                        <DatePicker date={startDate} setDate={setStartDate} />
                                        <input type="hidden" name="starts_on" value={startDate.toLocaleDateString()} />
                                        <InputError message={errors.starts_on} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="interval_unit">Frequency</Label>
                                        <Select name="interval_unit" defaultValue="month" disabled={processing}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="day">Daily</SelectItem>
                                                <SelectItem value="week">Weekly</SelectItem>
                                                <SelectItem value="month">Monthly</SelectItem>
                                                <SelectItem value="year">Yearly</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.interval_unit} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description (Optional)</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        placeholder="Additional notes about this subscription..."
                                        disabled={processing}
                                    />
                                    <InputError message={errors.description} />
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Switch id="active" checked={isActive} onCheckedChange={setIsActive} disabled={processing} />
                                    <input type="hidden" name="active" value={isActive ? '1' : '0'} />
                                    <Label htmlFor="active">Active</Label>
                                    <InputError message={errors.active} />
                                </div>
                            </div>

                            <DrawerFooter>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Creating...' : 'Create Subscription'}
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
