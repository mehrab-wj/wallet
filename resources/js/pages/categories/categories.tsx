import { useState } from 'react';
import { Head, Form } from '@inertiajs/react';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InputError from '@/components/input-error';
import Heading from '@/components/heading';
import type { Category } from '@/types/models';

interface CategoriesProps {
  expenseCategories: Category[];
  incomeCategories: Category[];
}

type CategoryType = 'expense' | 'income';

export default function Categories({ expenseCategories, incomeCategories }: CategoriesProps) {
  const [activeTab, setActiveTab] = useState<CategoryType>('expense');
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsEditDrawerOpen(true);
  };

  const resetCreateDrawer = () => {
    setIsCreateDrawerOpen(false);
  };

  const resetEditDrawer = () => {
    setIsEditDrawerOpen(false);
    setEditingCategory(null);
  };

  const getParentCategories = (type: CategoryType) => {
    const categories = type === 'expense' ? expenseCategories : incomeCategories;
    return categories.filter(cat => !cat.parent_id);
  };

  const getChildCategories = (parentId: number, type: CategoryType) => {
    const categories = type === 'expense' ? expenseCategories : incomeCategories;
    return categories.filter(cat => cat.parent_id === parentId);
  };

  const renderCategoriesList = (type: CategoryType) => {
    const categories = type === 'expense' ? expenseCategories : incomeCategories;
    const parentCategories = getParentCategories(type);

    if (categories.length === 0) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Tag className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="text-center mb-2">No {type} categories yet</CardTitle>
            <CardDescription className="text-center mb-4">
              Create your first {type} category to start organizing your transactions
            </CardDescription>
            <Drawer open={isCreateDrawerOpen} onOpenChange={setIsCreateDrawerOpen}>
              <DrawerTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4" />
                  Create {type === 'expense' ? 'Expense' : 'Income'} Category
                </Button>
              </DrawerTrigger>
            </Drawer>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {parentCategories.map((category) => {
          const children = getChildCategories(category.id, type);
          return (
            <Card key={category.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <CardDescription>
                      {children.length > 0 && `${children.length} subcategories`}
                    </CardDescription>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(category)}
                      className="h-8 w-8"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogTitle>Delete category?</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete "{category.name}"? 
                          {children.length > 0 && ` This will remove ${children.length} subcategories as well.`}
                          {' '}This action cannot be undone.
                        </DialogDescription>

                        <Form method="delete" action={route('categories.destroy', category.id)} options={{ preserveScroll: true }}>
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
              </CardHeader>
              
              {children.length > 0 && (
                <CardContent>
                  <div className="space-y-2">
                    {children.map((child) => (
                      <div key={child.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                        <span className="text-sm">{child.name}</span>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(child)}
                            className="h-6 w-6"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogTitle>Delete subcategory?</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to delete "{child.name}"? This action cannot be undone.
                              </DialogDescription>

                              <Form method="delete" action={route('categories.destroy', child.id)} options={{ preserveScroll: true }}>
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
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <AppLayout
      breadcrumbs={[
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Categories', href: '/categories' },
      ]}
    >
      <Head title="Categories" />

      <div className="space-y-6 p-4">
        <div className="flex items-center justify-between">
          <Heading title="Categories" />
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as CategoryType)}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <TabsList>
              <TabsTrigger value="expense">
                Expense Categories
              </TabsTrigger>
              <TabsTrigger value="income">
                Income Categories
              </TabsTrigger>
            </TabsList>

            <Drawer open={isCreateDrawerOpen} onOpenChange={setIsCreateDrawerOpen}>
              <DrawerTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4" />
                  Create {activeTab === 'expense' ? 'Expense' : 'Income'} Category
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <Form
                  method="post"
                  action={route('categories.store')}
                  onSuccess={resetCreateDrawer}
                  resetOnSuccess
                >
                  {({ processing, errors }) => (
                    <>
                      <DrawerHeader>
                        <DrawerTitle>Create New {activeTab === 'expense' ? 'Expense' : 'Income'} Category</DrawerTitle>
                        <DrawerDescription>
                          Add a new {activeTab} category to organize your transactions
                        </DrawerDescription>
                      </DrawerHeader>

                      <div className="px-4 space-y-4">
                        <input type="hidden" name="type" value={activeTab} />
                        
                        <div className="space-y-2">
                          <Label htmlFor="name">Category Name</Label>
                          <Input
                            id="name"
                            name="name"
                            placeholder={`e.g. ${activeTab === 'expense' ? 'Food, Transportation' : 'Salary, Freelance'}`}
                            required
                            disabled={processing}
                          />
                          <InputError message={errors.name} />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="parent_id">Parent Category (Optional)</Label>
                          <Select name="parent_id" disabled={processing}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select parent category..." />
                            </SelectTrigger>
                            <SelectContent>
                              {getParentCategories(activeTab).map((category) => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <InputError message={errors.parent_id} />
                        </div>
                      </div>

                      <DrawerFooter>
                        <Button type="submit" disabled={processing}>
                          {processing ? 'Creating...' : 'Create Category'}
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
          </div>

          <TabsContent value="expense">
            {renderCategoriesList('expense')}
          </TabsContent>

          <TabsContent value="income">
            {renderCategoriesList('income')}
          </TabsContent>
        </Tabs>

        {/* Edit Category Drawer */}
        <Drawer open={isEditDrawerOpen} onOpenChange={setIsEditDrawerOpen}>
          <DrawerContent>
            {editingCategory && (
              <Form
                method="put"
                action={route('categories.update', editingCategory.id)}
                onSuccess={resetEditDrawer}
              >
                {({ processing, errors }) => (
                  <>
                    <DrawerHeader>
                      <DrawerTitle>Edit Category</DrawerTitle>
                      <DrawerDescription>
                        Update your category information
                      </DrawerDescription>
                    </DrawerHeader>

                    <div className="px-4 space-y-4">
                      <input type="hidden" name="type" value={editingCategory.type} />
                      
                      <div className="space-y-2">
                        <Label htmlFor="edit-name">Category Name</Label>
                        <Input
                          id="edit-name"
                          name="name"
                          defaultValue={editingCategory.name}
                          placeholder="Category name"
                          required
                          disabled={processing}
                        />
                        <InputError message={errors.name} />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-parent_id">Parent Category (Optional)</Label>
                        <Select 
                          name="parent_id" 
                          defaultValue={editingCategory.parent_id?.toString() || 'none'} 
                          disabled={processing}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select parent category..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No parent (main category)</SelectItem>
                            {getParentCategories(editingCategory.type)
                              .filter(cat => cat.id !== editingCategory.id)
                              .map((category) => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                  {category.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <InputError message={errors.parent_id} />
                      </div>
                    </div>

                    <DrawerFooter>
                      <Button type="submit" disabled={processing}>
                        {processing ? 'Updating...' : 'Update Category'}
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
