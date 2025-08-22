<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class TransactionRequest extends FormRequest
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
                Rule::exists('categories', 'id')->where('user_id', Auth::id()),
            ],
            'type' => [
                'required',
                'string',
                Rule::in(['income', 'expense']),
            ],
            'input_amount' => [
                'required',
                'numeric',
                'min:0.01',
                'max:999999999.9999',
            ],
            'input_currency' => [
                'required',
                'string',
                'size:3',
                'uppercase',
            ],
            'label' => [
                'nullable',
                'string',
                'max:100',
            ],
            'description' => [
                'nullable',
                'string',
                'max:1000',
            ],
            'transaction_date' => [
                'required',
                'date',
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
            'account_id.exists' => 'The selected account does not exist or does not belong to you.',
            'category_id.exists' => 'The selected category does not exist or does not belong to you.',
            'input_currency.size' => 'Currency must be a 3-letter code (e.g., USD, EUR).',
            'input_currency.uppercase' => 'Currency must be uppercase.',
            'input_amount.min' => 'Amount must be at least 0.01.',
            'amount.min' => 'Final amount must be at least 0.01.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Ensure input_currency is uppercase
        if ($this->has('input_currency')) {
            $this->merge([
                'input_currency' => strtoupper($this->input('input_currency')),
            ]);
        }
    }
}
