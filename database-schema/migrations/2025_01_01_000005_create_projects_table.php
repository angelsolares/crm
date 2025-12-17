<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Creates the projects table for managing sales opportunities.
     * 
     * Status Options:
     * - active: Currently being worked
     * - on_hold: Temporarily paused
     * - completed: Successfully closed
     * - cancelled: No longer pursuing
     * 
     * Stage (Sales Pipeline):
     * - qualification: Initial assessment
     * - proposal: Preparing/sent proposal
     * - negotiation: Discussing terms
     * - closed_won: Deal won
     * - closed_lost: Deal lost
     * 
     * Interest Level: 1-10 scale for lead scoring
     * - 1-3: Cold lead
     * - 4-6: Warm lead  
     * - 7-10: Hot lead
     */
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('organization_id');
            $table->uuid('primary_contact_id')->nullable();
            $table->uuid('assigned_user_id')->nullable();
            $table->string('name', 255);
            $table->text('description')->nullable();
            $table->string('status', 50)->default('active'); // active, on_hold, completed, cancelled
            $table->unsignedTinyInteger('interest_level')->default(5); // 1-10 lead scoring
            $table->decimal('budget', 15, 2)->nullable();
            $table->string('currency', 3)->default('USD');
            $table->date('start_date')->nullable();
            $table->date('expected_close_date')->nullable();
            $table->date('actual_close_date')->nullable();
            $table->string('stage', 50)->default('qualification'); // qualification, proposal, negotiation, closed_won, closed_lost
            $table->jsonb('custom_fields')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('organization_id')
                ->references('id')
                ->on('organizations')
                ->cascadeOnDelete();

            $table->foreign('primary_contact_id')
                ->references('id')
                ->on('contacts')
                ->nullOnDelete();

            $table->foreign('assigned_user_id')
                ->references('id')
                ->on('users')
                ->nullOnDelete();

            $table->index(['organization_id', 'status']);
            $table->index(['status', 'stage']);
            $table->index('interest_level');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};


