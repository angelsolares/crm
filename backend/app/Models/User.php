<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, HasUuids, Notifiable;

    /**
     * Available roles in the system.
     */
    public const ROLE_ADMIN = 'admin';
    public const ROLE_MANAGER = 'manager';
    public const ROLE_SALES_REP = 'sales_rep';

    public const ROLES = [
        self::ROLE_ADMIN,
        self::ROLE_MANAGER,
        self::ROLE_SALES_REP,
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Check if user has a specific role.
     */
    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }

    /**
     * Check if user has any of the given roles.
     */
    public function hasAnyRole(array $roles): bool
    {
        return in_array($this->role, $roles);
    }

    /**
     * Check if user is an admin.
     */
    public function isAdmin(): bool
    {
        return $this->hasRole(self::ROLE_ADMIN);
    }

    /**
     * Check if user is a manager.
     */
    public function isManager(): bool
    {
        return $this->hasRole(self::ROLE_MANAGER);
    }

    /**
     * Check if user is a sales rep.
     */
    public function isSalesRep(): bool
    {
        return $this->hasRole(self::ROLE_SALES_REP);
    }

    /**
     * Check if user can manage other users (admin only).
     */
    public function canManageUsers(): bool
    {
        return $this->isAdmin();
    }

    /**
     * Get projects assigned to this user.
     */
    public function assignedProjects(): HasMany
    {
        return $this->hasMany(Project::class, 'assigned_user_id');
    }

    /**
     * Get meetings created by this user.
     */
    public function createdMeetings(): HasMany
    {
        return $this->hasMany(Meeting::class, 'created_by');
    }

    /**
     * Get proposals created by this user.
     */
    public function createdProposals(): HasMany
    {
        return $this->hasMany(Proposal::class, 'created_by');
    }

    /**
     * Get notes created by this user.
     */
    public function notes(): HasMany
    {
        return $this->hasMany(Note::class, 'user_id');
    }
}
