<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class SubscriptionRequest extends FormRequest
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
            'account_id' => [
                'required',
                'integer',
                Rule::exists('accounts', 'id')->where('user_id', Auth::id()),
            ],
            'category_id' => [
                'required',
                'integer',
                Rule::exists('categories', 'id')
                    ->where('user_id', Auth::id())
                    ->where('type', 'expense'),
            ],
            'vendor' => [
                'required',
                'string',
                'max:100',
            ],
            'description' => [
                'nullable',
                'string',
                'max:1000',
            ],
            'input_amount' => [
                'required',
                'numeric',
                'min:0.01',
                'max:999999999999.9999',
            ],
            'input_currency' => [
                'required',
                'string',
                'size:3',
                'regex:/^[A-Z]{3}$/',
            ],
            'starts_on' => [
                'required',
                'date',
                'after_or_equal:today',
            ],
            'interval_unit' => [
                'required',
                'string',
                'in:day,week,month,year',
            ],
            'active' => [
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
            'account_id.exists' => 'The selected account must belong to you.',
            'category_id.exists' => 'The selected category must be an expense category that belongs to you.',
            'input_currency.regex' => 'Currency must be a valid 3-letter ISO code (e.g., USD, EUR).',
            'starts_on.after_or_equal' => 'Start date cannot be in the past, Please select your next billing date.',
        ];
    }
}
