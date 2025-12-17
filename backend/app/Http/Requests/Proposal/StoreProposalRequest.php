<?php

namespace App\Http\Requests\Proposal;

use Illuminate\Foundation\Http\FormRequest;

class StoreProposalRequest extends FormRequest
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
     */
    public function rules(): array
    {
        return [
            'project_id' => ['required', 'uuid', 'exists:projects,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'discount_amount' => ['nullable', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'size:3'],
            'valid_until' => ['nullable', 'date', 'after:today'],
            'terms_conditions' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            
            // Line items
            'items' => ['required', 'array', 'min:1'],
            'items.*.description' => ['required', 'string', 'max:500'],
            'items.*.quantity' => ['required', 'numeric', 'min:0.01'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
            'items.*.discount_percent' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'items.*.tax_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'items.*.sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'project_id.required' => 'A project must be selected.',
            'project_id.exists' => 'The selected project does not exist.',
            'title.required' => 'The proposal title is required.',
            'items.required' => 'At least one line item is required.',
            'items.min' => 'At least one line item is required.',
            'items.*.description.required' => 'Each item must have a description.',
            'items.*.quantity.required' => 'Each item must have a quantity.',
            'items.*.unit_price.required' => 'Each item must have a unit price.',
            'valid_until.after' => 'The expiration date must be in the future.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Set default currency if not provided
        if (!$this->has('currency')) {
            $this->merge(['currency' => 'USD']);
        }

        // Set default valid_until if not provided (30 days from now)
        if (!$this->has('valid_until')) {
            $this->merge(['valid_until' => now()->addDays(30)->toDateString()]);
        }
    }
}



