<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Creates the contacts table for managing people associated with organizations.
     * 
     * Category Options:
     * - general: Standard contact
     * - decision_maker: Has authority to make purchasing decisions
     * - technical: Technical point of contact
     * - procurement: Handles purchasing/contracts
     * 
     * Source Options:
     * - referral: Referred by existing contact/client
     * - website: Came through website form
     * - event: Met at conference/event
     * - cold_call: Outbound prospecting
     * - linkedin: LinkedIn connection
     * - other: Other source
     */
    public function up(): void
    {
        Schema::create('contacts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('organization_id');
            $table->string('first_name', 100);
            $table->string('last_name', 100);
            $table->string('title', 100)->nullable(); // Job title/position
            $table->string('department', 100)->nullable();
            $table->string('category', 50)->default('general'); // general, decision_maker, technical, procurement
            $table->string('source', 50)->nullable(); // referral, website, event, cold_call, etc.
            $table->string('email', 255)->unique();
            $table->string('phone_country_code', 10)->nullable();
            $table->string('phone_number', 30)->nullable();
            $table->string('extension', 10)->nullable();
            $table->text('notes')->nullable();
            $table->string('photo_path', 255)->nullable();
            $table->string('status', 50)->default('active'); // active, inactive
            $table->boolean('is_primary')->default(false); // Primary contact for organization
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('organization_id')
                ->references('id')
                ->on('organizations')
                ->cascadeOnDelete();

            $table->index(['organization_id', 'status']);
        });

        // Full-text search index
        DB::statement("CREATE INDEX contact_search_idx ON contacts USING GIN (to_tsvector('english', coalesce(first_name, '') || ' ' || coalesce(last_name, '') || ' ' || coalesce(email, '')))");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contacts');
    }
};


