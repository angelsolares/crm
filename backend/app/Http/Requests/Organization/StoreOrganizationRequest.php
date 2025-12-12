<?php

namespace App\Http\Requests\Organization;

use App\Models\Organization;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOrganizationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Will be handled by Policy
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'parent_id' => ['nullable', 'uuid', 'exists:organizations,id'],
            'name' => ['required', 'string', 'max:255'],
            'industry_id' => ['nullable', 'integer', 'exists:industries,id'],
            'size' => ['nullable', 'string', Rule::in(array_keys(Organization::SIZES))],
            'website' => ['nullable', 'url', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone_country_code' => ['nullable', 'string', 'max:10'],
            'phone_number' => ['nullable', 'string', 'max:30'],
            'address_data' => ['nullable', 'array'],
            'address_data.street' => ['nullable', 'string', 'max:255'],
            'address_data.city' => ['nullable', 'string', 'max:100'],
            'address_data.state' => ['nullable', 'string', 'max:100'],
            'address_data.postal_code' => ['nullable', 'string', 'max:20'],
            'address_data.country' => ['nullable', 'string', 'max:100'],
            'logo' => ['nullable', 'image', 'max:2048'], // 2MB max
            'status' => ['nullable', 'string', Rule::in([
                Organization::STATUS_PROSPECT,
                Organization::STATUS_CLIENT,
                Organization::STATUS_INACTIVE,
            ])],
            'notes' => ['nullable', 'string'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'parent_id.exists' => 'The selected parent organization does not exist.',
            'name.required' => 'Organization name is required.',
            'industry_id.exists' => 'The selected industry is invalid.',
            'logo.max' => 'Logo file size must not exceed 2MB.',
        ];
    }
}

