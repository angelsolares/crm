<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrganizationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'type' => $this->type,
            'path' => $this->path,
            'depth' => $this->depth,
            'industry' => new IndustryResource($this->whenLoaded('industry')),
            'size' => $this->size,
            'website' => $this->website,
            'email' => $this->email,
            'phone' => [
                'country_code' => $this->phone_country_code,
                'number' => $this->phone_number,
                'full' => $this->full_phone,
            ],
            'address' => $this->address_data,
            'formatted_address' => $this->formatted_address,
            'logo_url' => $this->logo_path ? asset('storage/' . $this->logo_path) : null,
            'status' => $this->status,
            'notes' => $this->notes,
            'parent' => new OrganizationResource($this->whenLoaded('parent')),
            'children' => OrganizationResource::collection($this->whenLoaded('children')),
            'children_count' => $this->when(isset($this->children_count), $this->children_count),
            'contacts_count' => $this->when(isset($this->contacts_count), $this->contacts_count),
            'projects_count' => $this->when(isset($this->projects_count), $this->projects_count),
            'contacts' => ContactResource::collection($this->whenLoaded('contacts')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}

