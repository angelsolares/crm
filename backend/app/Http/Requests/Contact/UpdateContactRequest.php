<?php

namespace App\Http\Requests\Contact;

use App\Models\Contact;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateContactRequest extends FormRequest
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
        $contactId = $this->route('contact')->id ?? $this->route('contact');

        return [
            'first_name' => ['sometimes', 'required', 'string', 'max:100'],
            'last_name' => ['sometimes', 'required', 'string', 'max:100'],
            'title' => ['nullable', 'string', 'max:100'],
            'department' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', 'string', Rule::in([
                Contact::CATEGORY_GENERAL,
                Contact::CATEGORY_DECISION_MAKER,
                Contact::CATEGORY_TECHNICAL,
                Contact::CATEGORY_PROCUREMENT,
            ])],
            'source' => ['nullable', 'string', Rule::in(array_keys(Contact::SOURCES))],
            'email' => [
                'sometimes',
                'required',
                'email',
                'max:255',
                Rule::unique('contacts')->ignore($contactId),
            ],
            'phone_country_code' => ['nullable', 'string', 'max:10'],
            'phone_number' => ['nullable', 'string', 'max:30'],
            'extension' => ['nullable', 'string', 'max:10'],
            'notes' => ['nullable', 'string'],
            'photo' => ['nullable', 'image', 'max:2048'],
            'status' => ['nullable', 'string', Rule::in(['active', 'inactive'])],
            'is_primary' => ['nullable', 'boolean'],
        ];
    }
}

