<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Enable PostgreSQL LTree extension for hierarchical data.
     */
    public function up(): void
    {
        DB::statement('CREATE EXTENSION IF NOT EXISTS ltree');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP EXTENSION IF EXISTS ltree');
    }
};

