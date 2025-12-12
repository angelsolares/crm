<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContactResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'organization_id' => $this->organization_id,
            'organization' => new OrganizationResource($this->whenLoaded('organization')),
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'full_name' => $this->full_name,
            'title' => $this->title,
            'department' => $this->department,
            'category' => $this->category,
            'source' => $this->source,
            'email' => $this->email,
            'phone' => [
                'country_code' => $this->phone_country_code,
                'number' => $this->phone_number,
                'extension' => $this->extension,
                'full' => $this->full_phone,
            ],
            'notes' => $this->notes,
            'photo_url' => $this->photo_path ? asset('storage/' . $this->photo_path) : null,
            'status' => $this->status,
            'is_primary' => $this->is_primary,
            'projects' => ProjectResource::collection($this->whenLoaded('projects')),
            'meetings' => MeetingResource::collection($this->whenLoaded('meetings')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}

