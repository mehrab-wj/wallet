import { Form } from '@inertiajs/react';
import { useEffect, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

import type { Budget, Category } from '@/types/models';

interface EditBudgetDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    budget: Budget | null;
    expenseCategories: Category[];
}

export default function EditBudgetDrawer({ open, onOpenChange, budget, expenseCategories }: EditBudgetDrawerProps) {
    const [amountType, setAmountType] = useState<'fixed' | 'percentage'>('fixed');
    const [isActive, setIsActive] = useState<boolean>(true);
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

    useEffect(() => {
        if (budget) {
            setAmountType(budget.amount_type);
            setIsActive(budget.active);
            setSelectedCategories(budget.categories?.map((c) => c.id) || []);
        }
    }, [budget]);

    const handleSuccess = () => {
        onOpenChange(false);
    };

    const toggleCategory = (categoryId: number) => {
        setSelectedCategories((prev) =>
            prev.includes(categoryId)
                ? prev.filter((id) => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    if (!budget) {
        return null;
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent>
                <Form className="overflow-y-auto" method="put" action={route('budgets.update', budget.id)} onSuccess={handleSuccess}>
                    {({ processing, errors }) => (
                        <>
                            <DrawerHeader>
                                <DrawerTitle>Edit Budget</DrawerTitle>
                                <DrawerDescription>Update your budget settings</DrawerDescription>
                            </DrawerHeader>

                            <div className="space-y-4 px-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-name">Budget Name</Label>
                                    <Input
                                        id="edit-name"
                                        name="name"
                                        defaultValue={budget.name}
                                        placeholder="e.g. Social Life, Groceries, Entertainment"
                                        required
                                        disabled={processing}
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-amount_type">Amount Type</Label>
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
                                        <Label htmlFor="edit-amount_value">
                                            {amountType === 'fixed' ? 'Amount' : 'Percentage'}
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="edit-amount_value"
                                                name="amount_value"
                                                type="number"
                                                step={amountType === 'fixed' ? '0.01' : '1'}
                                                min="0"
                                                max={amountType === 'percentage' ? '100' : undefined}
                                                defaultValue={budget.amount_value}
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
                                                    id={`edit-category-${category.id}`}
                                                    checked={selectedCategories.includes(category.id)}
                                                    onCheckedChange={() => toggleCategory(category.id)}
                                                    disabled={processing}
                                                />
                                                <label
                                                    htmlFor={`edit-category-${category.id}`}
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
                                    <Switch
                                        id="edit-active"
                                        checked={isActive}
                                        onCheckedChange={setIsActive}
                                        disabled={processing}
                                    />
                                    <input type="hidden" name="active" value={isActive ? '1' : '0'} />
                                    <Label htmlFor="edit-active">Active</Label>
                                    <InputError message={errors.active} />
                                </div>
                            </div>

                            <DrawerFooter>
                                <Button type="submit" disabled={processing || selectedCategories.length === 0}>
                                    {processing ? 'Updating...' : 'Update Budget'}
                                </Button>
                                <Button variant="outline" onClick={() => onOpenChange(false)} disabled={processing}>
                                    Cancel
                                </Button>
                            </DrawerFooter>
                        </>
                    )}
                </Form>
            </DrawerContent>
        </Drawer>
    );
}

