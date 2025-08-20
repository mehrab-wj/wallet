<?php

namespace App\Http\Controllers;

use App\Http\Requests\CategoryRequest;
use App\Models\Category;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::where('user_id', Auth::id())
            ->orderBy('type')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        // Group categories by type for easier frontend handling
        $expenseCategories = $categories->where('type', 'expense')->values();
        $incomeCategories = $categories->where('type', 'income')->values();

        return Inertia::render('categories/categories', [
            'expenseCategories' => $expenseCategories,
            'incomeCategories' => $incomeCategories,
        ]);
    }

    public function store(CategoryRequest $request)
    {
        Category::create([
            'user_id' => Auth::id(),
            'name' => $request->validated()['name'],
            'type' => $request->validated()['type'],
            'parent_id' => $request->validated()['parent_id'] ?? null,
            'sort_order' => $request->validated()['sort_order'] ?? 0,
        ]);

        return redirect()->back();
    }

    public function update(CategoryRequest $request, Category $category)
    {
        // Ensure the category belongs to the authenticated user
        if ($category->user_id !== Auth::id()) {
            abort(403);
        }

        $category->update($request->validated());

        return redirect()->back();
    }

    public function destroy(Category $category)
    {
        // Ensure the category belongs to the authenticated user
        if ($category->user_id !== Auth::id()) {
            abort(403);
        }

        // If category has children, update them to have no parent
        Category::where('parent_id', $category->id)->update(['parent_id' => null]);

        $category->delete();

        return redirect()->back();
    }
}
