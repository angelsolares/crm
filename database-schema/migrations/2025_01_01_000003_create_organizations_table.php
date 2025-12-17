<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Creates the organizations table with LTree support for hierarchical data.
     * 
     * Hierarchy Types:
     * - parent: Top-level organization (headquarters)
     * - subsidiary: Child company owned by parent
     * - branch: Local office/branch of parent or subsidiary
     * 
     * Status Options:
     * - prospect: Potential client
     * - client: Active paying customer
     * - inactive: Former client or cold lead
     */
    public function up(): void
    {
        Schema::create('organizations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('parent_id')->nullable()->index();
            $table->string('name', 255);
            $table->string('type', 50)->default('parent'); // parent, subsidiary, branch
            $table->foreignId('industry_id')->nullable()->constrained('industries')->nullOnDelete();
            $table->string('size', 50)->nullable(); // Small, Medium, Large, Enterprise
            $table->string('website', 255)->nullable();
            $table->string('email', 255)->nullable();
            $table->string('phone_country_code', 10)->nullable();
            $table->string('phone_number', 30)->nullable();
            $table->jsonb('address_data')->nullable();
            $table->string('logo_path', 255)->nullable();
            $table->string('status', 50)->default('prospect'); // prospect, client, inactive
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // Add self-referencing foreign key after table creation
        Schema::table('organizations', function (Blueprint $table) {
            $table->foreign('parent_id')
                ->references('id')
                ->on('organizations')
                ->nullOnDelete();
        });

        // Add LTree column and GIST index for hierarchical queries
        DB::statement('ALTER TABLE organizations ADD COLUMN path ltree');
        DB::statement('CREATE INDEX org_path_gist_idx ON organizations USING GIST (path)');
        DB::statement('CREATE INDEX org_path_btree_idx ON organizations USING BTREE (path)');
        
        // Full-text search index for quick searching
        DB::statement("CREATE INDEX org_search_idx ON organizations USING GIN (to_tsvector('english', coalesce(name, '') || ' ' || coalesce(email, '')))");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('organizations');
    }
};


