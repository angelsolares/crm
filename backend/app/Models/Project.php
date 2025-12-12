<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Project extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'organization_id',
        'primary_contact_id',
        'assigned_user_id',
        'name',
        'description',
        'status',
        'interest_level',
        'budget',
        'currency',
        'start_date',
        'expected_close_date',
        'actual_close_date',
        'stage',
        'custom_fields',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'interest_level' => 'integer',
        'budget' => 'decimal:2',
        'start_date' => 'date',
        'expected_close_date' => 'date',
        'actual_close_date' => 'date',
        'custom_fields' => 'array',
    ];

    /**
     * Project statuses.
     */
    public const STATUS_ACTIVE = 'active';
    public const STATUS_ON_HOLD = 'on_hold';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_CANCELLED = 'cancelled';

    /**
     * Project stages (sales pipeline).
     */
    public const STAGES = [
        'qualification' => 'Qualification',
        'needs_analysis' => 'Needs Analysis',
        'proposal' => 'Proposal',
        'negotiation' => 'Negotiation',
        'closed_won' => 'Closed Won',
        'closed_lost' => 'Closed Lost',
    ];

    /**
     * Get the organization.
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * Get the primary contact.
     */
    public function primaryContact(): BelongsTo
    {
        return $this->belongsTo(Contact::class, 'primary_contact_id');
    }

    /**
     * Get the assigned user.
     */
    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_user_id');
    }

    /**
     * Get the meetings.
     */
    public function meetings(): HasMany
    {
        return $this->hasMany(Meeting::class);
    }

    /**
     * Get the proposals.
     */
    public function proposals(): HasMany
    {
        return $this->hasMany(Proposal::class);
    }

    /**
     * Scope to active projects.
     */
    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }

    /**
     * Scope by stage.
     */
    public function scopeByStage($query, string $stage)
    {
        return $query->where('stage', $stage);
    }

    /**
     * Scope by interest level range.
     */
    public function scopeHighInterest($query, int $minLevel = 7)
    {
        return $query->where('interest_level', '>=', $minLevel);
    }

    /**
     * Get the interest level label.
     */
    public function getInterestLabelAttribute(): string
    {
        return match (true) {
            $this->interest_level >= 8 => 'High',
            $this->interest_level >= 5 => 'Medium',
            default => 'Low',
        };
    }

    /**
     * Check if project is closed.
     */
    public function isClosed(): bool
    {
        return in_array($this->stage, ['closed_won', 'closed_lost']);
    }
}

