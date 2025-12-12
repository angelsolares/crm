<?php

namespace App\Http\Requests\Contact;

use App\Models\Contact;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreContactRequest extends FormRequest
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
            'organization_id' => ['required', 'uuid', 'exists:organizations,id'],
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'title' => ['nullable', 'string', 'max:100'],
            'department' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', 'string', Rule::in([
                Contact::CATEGORY_GENERAL,
                Contact::CATEGORY_DECISION_MAKER,
                Contact::CATEGORY_TECHNICAL,
                Contact::CATEGORY_PROCUREMENT,
            ])],
            'source' => ['nullable', 'string', Rule::in(array_keys(Contact::SOURCES))],
            'email' => ['required', 'email', 'max:255', 'unique:contacts,email'],
            'phone_country_code' => ['nullable', 'string', 'max:10'],
            'phone_number' => ['nullable', 'string', 'max:30'],
            'extension' => ['nullable', 'string', 'max:10'],
            'notes' => ['nullable', 'string'],
            'photo' => ['nullable', 'image', 'max:2048'],
            'is_primary' => ['nullable', 'boolean'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'organization_id.required' => 'Please select an organization.',
            'email.unique' => 'A contact with this email already exists.',
        ];
    }
}

