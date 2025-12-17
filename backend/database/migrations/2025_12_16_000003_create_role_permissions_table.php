<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * This table stores configurable permissions for each role.
     * Format: role + module + action = allowed (boolean)
     */
    public function up(): void
    {
        Schema::create('role_permissions', function (Blueprint $table) {
            $table->id();
            $table->string('role', 50)->index(); // admin, manager, sales_rep
            $table->string('module', 50)->index(); // organizations, contacts, projects, etc.
            $table->string('action', 50)->index(); // view, create, update, delete, etc.
            $table->boolean('allowed')->default(false);
            $table->timestamps();
            
            // Unique constraint: one permission per role/module/action combination
            $table->unique(['role', 'module', 'action'], 'role_module_action_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('role_permissions');
    }
};

