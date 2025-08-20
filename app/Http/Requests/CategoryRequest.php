<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class CategoryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $categoryId = $this->route('category')?->id;

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('categories', 'name')
                    ->where('user_id', Auth::id())
                    ->where('type', $this->type)
                    ->ignore($categoryId),
            ],
            'type' => [
                'required',
                'string',
                'in:expense,income',
            ],
            'parent_id' => [
                'nullable',
                'string',
                function ($attribute, $value, $fail) use ($categoryId) {
                    // Skip validation if value is "none" (will be converted to null)
                    if ($value === 'none' || $value === null || $value === '') {
                        return;
                    }
                    
                    // Validate it's an integer
                    if (!is_numeric($value)) {
                        $fail('The parent category must be valid.');
                        return;
                    }
                    
                    // Check if parent exists and belongs to user with same type
                    $parentExists = \App\Models\Category::where('id', $value)
                        ->where('user_id', Auth::id())
                        ->where('type', $this->type)
                        ->exists();
                        
                    if (!$parentExists) {
                        $fail('The selected parent category must belong to you and be of the same type.');
                        return;
                    }
                    
                    // Prevent self-referencing (category cannot be its own parent)
                    if ($categoryId && $value == $categoryId) {
                        $fail('A category cannot be its own parent.');
                    }
                },
            ],
            'sort_order' => [
                'nullable',
                'integer',
                'min:0',
            ],
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation()
    {
        // Convert "none" to null for parent_id
        if ($this->parent_id === 'none') {
            $this->merge(['parent_id' => null]);
        }
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.unique' => 'You already have a :attribute category with this name.',
            'type.in' => 'Category type must be either expense or income.',
            'parent_id.exists' => 'The selected parent category must belong to you and be of the same type.',
        ];
    }
}
