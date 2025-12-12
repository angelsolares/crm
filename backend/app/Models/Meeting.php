<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Meeting extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'project_id',
        'organization_id',
        'created_by',
        'title',
        'description',
        'type',
        'location',
        'scheduled_at',
        'duration_minutes',
        'outcome',
        'action_items',
        'follow_up_date',
        'status',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'scheduled_at' => 'datetime',
        'follow_up_date' => 'datetime',
        'duration_minutes' => 'integer',
    ];

    /**
     * Meeting types.
     */
    public const TYPE_VIRTUAL = 'virtual';
    public const TYPE_IN_PERSON = 'in_person';
    public const TYPE_PHONE = 'phone';

    /**
     * Meeting statuses.
     */
    public const STATUS_SCHEDULED = 'scheduled';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_CANCELLED = 'cancelled';
    public const STATUS_RESCHEDULED = 'rescheduled';

    /**
     * Get the project.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the organization.
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * Get the user who created the meeting.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the attendees.
     */
    public function attendees(): BelongsToMany
    {
        return $this->belongsToMany(Contact::class, 'meeting_attendees')
            ->withPivot('status')
            ->withTimestamps();
    }

    /**
     * Scope to upcoming meetings.
     */
    public function scopeUpcoming($query)
    {
        return $query->where('scheduled_at', '>', now())
            ->where('status', self::STATUS_SCHEDULED)
            ->orderBy('scheduled_at', 'asc');
    }

    /**
     * Scope to past meetings.
     */
    public function scopePast($query)
    {
        return $query->where('scheduled_at', '<', now())
            ->orderBy('scheduled_at', 'desc');
    }

    /**
     * Scope to meetings needing follow-up.
     */
    public function scopeNeedsFollowUp($query)
    {
        return $query->whereNotNull('follow_up_date')
            ->where('follow_up_date', '<=', now())
            ->where('status', self::STATUS_COMPLETED);
    }

    /**
     * Get the end time.
     */
    public function getEndTimeAttribute()
    {
        return $this->scheduled_at?->addMinutes($this->duration_minutes);
    }

    /**
     * Check for time conflict with another meeting.
     */
    public function hasConflict(Meeting $other): bool
    {
        if ($this->id === $other->id) {
            return false;
        }

        $thisStart = $this->scheduled_at;
        $thisEnd = $this->end_time;
        $otherStart = $other->scheduled_at;
        $otherEnd = $other->end_time;

        return $thisStart < $otherEnd && $thisEnd > $otherStart;
    }
}

