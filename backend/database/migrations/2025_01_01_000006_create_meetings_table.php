<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('meetings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('project_id')->nullable();
            $table->uuid('organization_id')->nullable();
            $table->uuid('created_by')->nullable();
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->string('type', 50)->default('virtual'); // virtual, in_person, phone
            $table->string('location', 255)->nullable(); // Physical address or meeting URL
            $table->timestamp('scheduled_at');
            $table->unsignedInteger('duration_minutes')->default(60);
            $table->text('outcome')->nullable();
            $table->text('action_items')->nullable();
            $table->timestamp('follow_up_date')->nullable();
            $table->string('status', 50)->default('scheduled'); // scheduled, completed, cancelled, rescheduled
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('project_id')
                ->references('id')
                ->on('projects')
                ->nullOnDelete();

            $table->foreign('organization_id')
                ->references('id')
                ->on('organizations')
                ->nullOnDelete();

            $table->foreign('created_by')
                ->references('id')
                ->on('users')
                ->nullOnDelete();

            $table->index(['scheduled_at', 'status']);
            $table->index('organization_id');
        });

        // Meeting attendees pivot table
        Schema::create('meeting_attendees', function (Blueprint $table) {
            $table->uuid('meeting_id');
            $table->uuid('contact_id');
            $table->string('status', 50)->default('pending'); // pending, confirmed, declined, attended
            $table->timestamps();

            $table->primary(['meeting_id', 'contact_id']);

            $table->foreign('meeting_id')
                ->references('id')
                ->on('meetings')
                ->cascadeOnDelete();

            $table->foreign('contact_id')
                ->references('id')
                ->on('contacts')
                ->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meeting_attendees');
        Schema::dropIfExists('meetings');
    }
};

