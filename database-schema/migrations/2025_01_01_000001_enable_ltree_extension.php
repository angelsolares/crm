<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Enable PostgreSQL LTree extension for hierarchical data.
     * 
     * LTree provides a data type for representing labels of data stored 
     * in a hierarchical tree-like structure. It's used for the organizations
     * hierarchy (Parent → Subsidiary → Branch).
     * 
     * @see https://www.postgresql.org/docs/current/ltree.html
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


