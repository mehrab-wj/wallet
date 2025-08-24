import { Form } from '@inertiajs/react';
import { useEffect, useState } from 'react';

import CurrencySelect from '@/components/currency-select';
import { DatePicker } from '@/components/dates/date-picker';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

import type { Account, Category, Subscription } from '@/types/models';
import { Trash2 } from 'lucide-react';

interface EditSubscriptionDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    accounts: Account[];
    expenseCategories: Category[];
    subscription: Subscription | null;
    onSuccess: () => void;
}

export default function EditSubscriptionDrawer({
    open,
    onOpenChange,
    accounts,
    expenseCategories,
    subscription,
    onSuccess,
}: EditSubscriptionDrawerProps) {
    const [startDate, setStartDate] = useState<Date>(new Date());
    const [inputCurrency, setInputCurrency] = useState<string>('USD');
    const [isActive, setIsActive] = useState<boolean>(true);

    useEffect(() => {
        if (subscription) {
            setStartDate(new Date(subscription.starts_on));
            setInputCurrency(subscription.input_currency);
            setIsActive(subscription.active);
        }
    }, [subscription]);

    const handleSuccess = () => {
        onSuccess();
    };

    if (!subscription) {
        return null;
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent>
                <div className="overflow-y-auto">
                    <Form method="put" action={route('subscriptions.update', subscription.id)} onSuccess={handleSuccess}>
                        {({ processing, errors }) => (
                            <>
                                <DrawerHeader>
                                    <DrawerTitle>Edit Subscription</DrawerTitle>
                                    <DrawerDescription>Update your subscription information</DrawerDescription>
                                </DrawerHeader>

                                <div className="space-y-4 px-4">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="edit-vendor">Vendor/Service Name</Label>
                                            <Input
                                                id="edit-vendor"
                                                name="vendor"
                                                defaultValue={subscription.vendor}
                                                placeholder="e.g. Netflix, Spotify, Adobe"
                                                required
                                                disabled={processing}
                                            />
                                            <InputError message={errors.vendor} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="edit-account_id">Account</Label>
                                            <Select
                                                name="account_id"
                                                defaultValue={subscription.account_id.toString()}
                                                onValueChange={(value) => {
                                                    const accountCurrency = accounts.find((account) => account.id.toString() === value)?.currency;
                                                    if (accountCurrency) {
                                                        setInputCurrency(accountCurrency);
                                                    }
                                                }}
                                                disabled={processing}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
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
                                        <Label htmlFor="edit-category_id">Category</Label>
                                        <Select name="category_id" defaultValue={subscription.category_id.toString()} disabled={processing}>
                                            <SelectTrigger>
                                                <SelectValue />
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
                                            <Label htmlFor="edit-input_amount">Amount</Label>
                                            <Input
                                                id="edit-input_amount"
                                                name="input_amount"
                                                type="number"
                                                step="0.01"
                                                min="0.01"
                                                defaultValue={subscription.input_amount}
                                                required
                                                disabled={processing}
                                            />
                                            <InputError message={errors.input_amount} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="edit-input_currency">Currency</Label>
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
                                            <Label htmlFor="edit-starts_on">Start Date</Label>
                                            <DatePicker date={startDate} setDate={setStartDate} />
                                            <input type="hidden" name="starts_on" value={startDate.toLocaleDateString()} />
                                            <InputError message={errors.starts_on} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="edit-interval_unit">Frequency</Label>
                                            <Select name="interval_unit" defaultValue={subscription.interval_unit} disabled={processing}>
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
                                        <Label htmlFor="edit-description">Description (Optional)</Label>
                                        <Textarea
                                            id="edit-description"
                                            name="description"
                                            defaultValue={subscription.description || ''}
                                            placeholder="Additional notes about this subscription..."
                                            disabled={processing}
                                        />
                                        <InputError message={errors.description} />
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Switch id="edit-active" checked={isActive} onCheckedChange={setIsActive} disabled={processing} />
                                        <input type="hidden" name="active" value={isActive ? '1' : '0'} />
                                        <Label htmlFor="edit-active">Active</Label>
                                    </div>
                                </div>

                                <DrawerFooter>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Updating...' : 'Update Subscription'}
                                    </Button>
                                </DrawerFooter>
                            </>
                        )}
                    </Form>

                    <Dialog>
                        <DialogTrigger asChild>
                            <div className="mb-4 w-full px-4">
                                <Button variant="ghost" className="w-full text-destructive hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                    Delete Subscription
                                </Button>
                            </div>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogTitle>Delete subscription?</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete the "{subscription.vendor}" subscription? This action cannot be undone.
                            </DialogDescription>

                            <Form
                                method="delete"
                                action={route('subscriptions.destroy', subscription.id)}
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
