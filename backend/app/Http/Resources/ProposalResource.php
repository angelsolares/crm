<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProposalResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'project_id' => $this->project_id,
            'project' => new ProjectResource($this->whenLoaded('project')),
            'created_by' => $this->created_by,
            'creator' => $this->whenLoaded('creator', function () {
                return [
                    'id' => $this->creator->id,
                    'name' => $this->creator->name,
                ];
            }),
            'title' => $this->title,
            'reference_number' => $this->reference_number,
            'description' => $this->description,
            'status' => $this->status,
            'subtotal' => $this->subtotal,
            'discount_amount' => $this->discount_amount,
            'tax_amount' => $this->tax_amount,
            'total_amount' => $this->total_amount,
            'currency' => $this->currency,
            'formatted_total' => number_format($this->total_amount, 2) . ' ' . $this->currency,
            'valid_until' => $this->valid_until?->toDateString(),
            'sent_at' => $this->sent_at?->toISOString(),
            'viewed_at' => $this->viewed_at?->toISOString(),
            'responded_at' => $this->responded_at?->toISOString(),
            'file_url' => $this->file_path ? asset('storage/' . $this->file_path) : null,
            'terms_conditions' => $this->terms_conditions,
            'notes' => $this->notes,
            'is_expired' => $this->isExpired(),
            'is_editable' => $this->isEditable(),
            'items' => ProposalItemResource::collection($this->whenLoaded('items')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}

