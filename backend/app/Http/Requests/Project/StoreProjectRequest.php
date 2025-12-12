<?php

namespace App\Http\Requests\Project;

use App\Models\Project;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProjectRequest extends FormRequest
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
            'primary_contact_id' => ['nullable', 'uuid', 'exists:contacts,id'],
            'assigned_user_id' => ['nullable', 'uuid', 'exists:users,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', 'string', Rule::in([
                Project::STATUS_ACTIVE,
                Project::STATUS_ON_HOLD,
                Project::STATUS_COMPLETED,
                Project::STATUS_CANCELLED,
            ])],
            'interest_level' => ['nullable', 'integer', 'min:1', 'max:10'],
            'budget' => ['nullable', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'size:3'],
            'start_date' => ['nullable', 'date'],
            'expected_close_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'stage' => ['nullable', 'string', Rule::in(array_keys(Project::STAGES))],
            'custom_fields' => ['nullable', 'array'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'organization_id.required' => 'Please select an organization.',
            'name.required' => 'Project name is required.',
            'interest_level.min' => 'Interest level must be at least 1.',
            'interest_level.max' => 'Interest level cannot exceed 10.',
        ];
    }
}

