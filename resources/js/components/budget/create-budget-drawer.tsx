import { Form } from '@inertiajs/react';
import { useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

import type { Category } from '@/types/models';

interface CreateBudgetDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    expenseCategories: Category[];
}

export default function CreateBudgetDrawer({ open, onOpenChange, expenseCategories }: CreateBudgetDrawerProps) {
    const [amountType, setAmountType] = useState<'fixed' | 'percentage'>('fixed');
    const [isActive, setIsActive] = useState<boolean>(true);
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

    const handleSuccess = () => {
        // Reset state and close drawer
        setAmountType('fixed');
        setIsActive(true);
        setSelectedCategories([]);
        onOpenChange(false);
    };

    const toggleCategory = (categoryId: number) => {
        setSelectedCategories((prev) =>
            prev.includes(categoryId)
                ? prev.filter((id) => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent>
                <Form className="overflow-y-auto" method="post" action={route('budgets.store')} onSuccess={handleSuccess} resetOnSuccess>
                    {({ processing, errors }) => (
                        <>
                            <DrawerHeader>
                                <DrawerTitle>Create New Budget</DrawerTitle>
                                <DrawerDescription>Set up a budget to track spending across categories</DrawerDescription>
                            </DrawerHeader>

                            <div className="space-y-4 px-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Budget Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="e.g. Social Life, Groceries, Entertainment"
                                        required
                                        disabled={processing}
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="amount_type">Amount Type</Label>
                                        <Select
                                            name="amount_type"
                                            value={amountType}
                                            onValueChange={(value) => setAmountType(value as 'fixed' | 'percentage')}
                                            required
                                            disabled={processing}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="fixed">Fixed Amount</SelectItem>
                                                <SelectItem value="percentage">Percentage of Income</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.amount_type} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="amount_value">
                                            {amountType === 'fixed' ? 'Amount' : 'Percentage'}
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="amount_value"
                                                name="amount_value"
                                                type="number"
                                                step={amountType === 'fixed' ? '0.01' : '1'}
                                                min="0"
                                                max={amountType === 'percentage' ? '100' : undefined}
                                                placeholder={amountType === 'fixed' ? '0.00' : '0'}
                                                required
                                                disabled={processing}
                                            />
                                            {amountType === 'percentage' && (
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                                    %
                                                </span>
                                            )}
                                        </div>
                                        <InputError message={errors.amount_value} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Categories</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Select the expense categories to include in this budget
                                    </p>
                                    <div className="max-h-60 space-y-2 overflow-y-auto rounded-md border p-4">
                                        {expenseCategories.map((category) => (
                                            <div key={category.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`category-${category.id}`}
                                                    checked={selectedCategories.includes(category.id)}
                                                    onCheckedChange={() => toggleCategory(category.id)}
                                                    disabled={processing}
                                                />
                                                <label
                                                    htmlFor={`category-${category.id}`}
                                                    className="flex-1 cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    {category.name}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                    {selectedCategories.map((categoryId) => (
                                        <input
                                            key={categoryId}
                                            type="hidden"
                                            name="category_ids[]"
                                            value={categoryId}
                                        />
                                    ))}
                                    <InputError message={errors.category_ids} />
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Switch id="active" checked={isActive} onCheckedChange={setIsActive} disabled={processing} />
                                    <input type="hidden" name="active" value={isActive ? '1' : '0'} />
                                    <Label htmlFor="active">Active</Label>
                                    <InputError message={errors.active} />
                                </div>
                            </div>

                            <DrawerFooter>
                                <Button type="submit" disabled={processing || selectedCategories.length === 0}>
                                    {processing ? 'Creating...' : 'Create Budget'}
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

