<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class BudgetRequest extends FormRequest
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
        return [
            'name' => [
                'required',
                'string',
                'max:100',
            ],
            'amount_type' => [
                'required',
                'string',
                Rule::in(['fixed', 'percentage']),
            ],
            'amount_value' => [
                'required',
                'numeric',
                'min:0',
                function ($attribute, $value, $fail) {
                    if ($this->input('amount_type') === 'percentage' && $value > 100) {
                        $fail('The percentage value cannot exceed 100.');
                    }
                },
            ],
            'category_ids' => [
                'required',
                'array',
                'min:1',
            ],
            'category_ids.*' => [
                'integer',
                Rule::exists('categories', 'id')->where('user_id', Auth::id()),
            ],
            'active' => [
                'sometimes',
                'boolean',
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Budget name is required.',
            'name.max' => 'Budget name cannot exceed 100 characters.',
            'amount_type.required' => 'Amount type is required.',
            'amount_type.in' => 'Amount type must be either fixed or percentage.',
            'amount_value.required' => 'Amount value is required.',
            'amount_value.min' => 'Amount value must be at least 0.',
            'category_ids.required' => 'At least one category must be selected.',
            'category_ids.min' => 'At least one category must be selected.',
            'category_ids.*.exists' => 'One or more selected categories do not exist or do not belong to you.',
        ];
    }
}
