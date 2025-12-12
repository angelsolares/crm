<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
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
            'primary_contact_id' => $this->primary_contact_id,
            'primary_contact' => new ContactResource($this->whenLoaded('primaryContact')),
            'assigned_user_id' => $this->assigned_user_id,
            'assigned_user' => $this->whenLoaded('assignedUser', function () {
                return [
                    'id' => $this->assignedUser->id,
                    'name' => $this->assignedUser->name,
                ];
            }),
            'name' => $this->name,
            'description' => $this->description,
            'status' => $this->status,
            'interest_level' => $this->interest_level,
            'interest_label' => $this->interest_label,
            'budget' => $this->budget,
            'currency' => $this->currency,
            'formatted_budget' => $this->budget 
                ? number_format($this->budget, 2) . ' ' . $this->currency 
                : null,
            'start_date' => $this->start_date?->toDateString(),
            'expected_close_date' => $this->expected_close_date?->toDateString(),
            'actual_close_date' => $this->actual_close_date?->toDateString(),
            'stage' => $this->stage,
            'stage_label' => \App\Models\Project::STAGES[$this->stage] ?? $this->stage,
            'custom_fields' => $this->custom_fields,
            'meetings' => MeetingResource::collection($this->whenLoaded('meetings')),
            'proposals' => ProposalResource::collection($this->whenLoaded('proposals')),
            'is_closed' => $this->isClosed(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}

