<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Organization extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'parent_id',
        'name',
        'type',
        'industry_id',
        'size',
        'website',
        'email',
        'phone_country_code',
        'phone_number',
        'address_data',
        'logo_path',
        'status',
        'notes',
        'path',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'address_data' => 'array',
    ];

    /**
     * Organization types.
     */
    public const TYPE_PARENT = 'parent';
    public const TYPE_SUBSIDIARY = 'subsidiary';
    public const TYPE_BRANCH = 'branch';

    /**
     * Organization statuses.
     */
    public const STATUS_PROSPECT = 'prospect';
    public const STATUS_CLIENT = 'client';
    public const STATUS_INACTIVE = 'inactive';

    /**
     * Organization sizes.
     */
    public const SIZES = [
        'small' => 'Small (1-50 employees)',
        'medium' => 'Medium (51-200 employees)',
        'large' => 'Large (201-1000 employees)',
        'enterprise' => 'Enterprise (1000+ employees)',
    ];

    /**
     * Get the parent organization.
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'parent_id');
    }

    /**
     * Get the children organizations.
     */
    public function children(): HasMany
    {
        return $this->hasMany(Organization::class, 'parent_id');
    }

    /**
     * Get the industry.
     */
    public function industry(): BelongsTo
    {
        return $this->belongsTo(Industry::class);
    }

    /**
     * Get the contacts.
     */
    public function contacts(): HasMany
    {
        return $this->hasMany(Contact::class);
    }

    /**
     * Get the projects.
     */
    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }

    /**
     * Get the meetings.
     */
    public function meetings(): HasMany
    {
        return $this->hasMany(Meeting::class);
    }

    /**
     * Get all descendants using LTree.
     */
    public function descendants()
    {
        return $this->where('path', '<@', $this->path)
            ->where('id', '!=', $this->id);
    }

    /**
     * Get all ancestors using LTree.
     */
    public function ancestors()
    {
        return $this->where('path', '@>', $this->path)
            ->where('id', '!=', $this->id);
    }

    /**
     * Get the full phone number.
     */
    public function getFullPhoneAttribute(): ?string
    {
        if (!$this->phone_number) {
            return null;
        }
        
        return trim($this->phone_country_code . ' ' . $this->phone_number);
    }

    /**
     * Get the formatted address.
     */
    public function getFormattedAddressAttribute(): ?string
    {
        if (!$this->address_data) {
            return null;
        }

        $parts = array_filter([
            $this->address_data['street'] ?? null,
            $this->address_data['city'] ?? null,
            $this->address_data['state'] ?? null,
            $this->address_data['postal_code'] ?? null,
            $this->address_data['country'] ?? null,
        ]);

        return implode(', ', $parts);
    }

    /**
     * Check if organization is a root/parent.
     */
    public function isParent(): bool
    {
        return $this->type === self::TYPE_PARENT;
    }

    /**
     * Check if organization is a subsidiary.
     */
    public function isSubsidiary(): bool
    {
        return $this->type === self::TYPE_SUBSIDIARY;
    }

    /**
     * Check if organization is a branch.
     */
    public function isBranch(): bool
    {
        return $this->type === self::TYPE_BRANCH;
    }

    /**
     * Get the hierarchy depth.
     */
    public function getDepthAttribute(): int
    {
        if (!$this->path) {
            return 0;
        }
        
        return substr_count($this->path, '.') + 1;
    }
}

