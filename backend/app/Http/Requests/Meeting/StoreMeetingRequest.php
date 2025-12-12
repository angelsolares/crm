<?php

namespace App\Http\Requests\Meeting;

use App\Models\Meeting;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMeetingRequest extends FormRequest
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
            'project_id' => ['nullable', 'uuid', 'exists:projects,id'],
            'organization_id' => ['nullable', 'uuid', 'exists:organizations,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'type' => ['nullable', 'string', Rule::in([
                Meeting::TYPE_VIRTUAL,
                Meeting::TYPE_IN_PERSON,
                Meeting::TYPE_PHONE,
            ])],
            'location' => ['nullable', 'string', 'max:255'],
            'scheduled_at' => ['required', 'date', 'after:now'],
            'duration_minutes' => ['nullable', 'integer', 'min:15', 'max:480'],
            'follow_up_date' => ['nullable', 'date', 'after:scheduled_at'],
            'attendee_ids' => ['nullable', 'array'],
            'attendee_ids.*' => ['uuid', 'exists:contacts,id'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'title.required' => 'Meeting title is required.',
            'scheduled_at.required' => 'Please select a date and time.',
            'scheduled_at.after' => 'Meeting must be scheduled in the future.',
        ];
    }
}

