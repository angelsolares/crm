<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Contact extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'organization_id',
        'first_name',
        'last_name',
        'title',
        'department',
        'category',
        'source',
        'email',
        'phone_country_code',
        'phone_number',
        'extension',
        'notes',
        'photo_path',
        'status',
        'is_primary',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'is_primary' => 'boolean',
    ];

    /**
     * Contact categories.
     */
    public const CATEGORY_GENERAL = 'general';
    public const CATEGORY_DECISION_MAKER = 'decision_maker';
    public const CATEGORY_TECHNICAL = 'technical';
    public const CATEGORY_PROCUREMENT = 'procurement';

    /**
     * Contact sources.
     */
    public const SOURCES = [
        'referral' => 'Referral',
        'website' => 'Website',
        'event' => 'Event',
        'cold_call' => 'Cold Call',
        'linkedin' => 'LinkedIn',
        'email_campaign' => 'Email Campaign',
        'partner' => 'Partner',
        'other' => 'Other',
    ];

    /**
     * Get the organization.
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * Get the projects where this contact is primary.
     */
    public function projects(): HasMany
    {
        return $this->hasMany(Project::class, 'primary_contact_id');
    }

    /**
     * Get the meetings this contact is attending.
     */
    public function meetings(): BelongsToMany
    {
        return $this->belongsToMany(Meeting::class, 'meeting_attendees')
            ->withPivot('status')
            ->withTimestamps();
    }

    /**
     * Get the full name.
     */
    public function getFullNameAttribute(): string
    {
        return trim($this->first_name . ' ' . $this->last_name);
    }

    /**
     * Get the full phone number.
     */
    public function getFullPhoneAttribute(): ?string
    {
        if (!$this->phone_number) {
            return null;
        }
        
        $phone = trim($this->phone_country_code . ' ' . $this->phone_number);
        
        if ($this->extension) {
            $phone .= ' ext. ' . $this->extension;
        }
        
        return $phone;
    }

    /**
     * Scope to active contacts.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope to primary contacts.
     */
    public function scopePrimary($query)
    {
        return $query->where('is_primary', true);
    }
}

