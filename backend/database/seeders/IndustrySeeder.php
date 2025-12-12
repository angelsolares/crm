<?php

namespace Database\Seeders;

use App\Models\Industry;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class IndustrySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $industries = [
            ['name' => 'Technology', 'icon' => 'computer'],
            ['name' => 'Healthcare', 'icon' => 'medical'],
            ['name' => 'Finance', 'icon' => 'bank'],
            ['name' => 'Manufacturing', 'icon' => 'factory'],
            ['name' => 'Retail', 'icon' => 'store'],
            ['name' => 'Education', 'icon' => 'school'],
            ['name' => 'Real Estate', 'icon' => 'building'],
            ['name' => 'Hospitality', 'icon' => 'hotel'],
            ['name' => 'Transportation', 'icon' => 'truck'],
            ['name' => 'Energy', 'icon' => 'bolt'],
            ['name' => 'Telecommunications', 'icon' => 'phone'],
            ['name' => 'Media & Entertainment', 'icon' => 'film'],
            ['name' => 'Agriculture', 'icon' => 'leaf'],
            ['name' => 'Construction', 'icon' => 'hammer'],
            ['name' => 'Legal Services', 'icon' => 'gavel'],
            ['name' => 'Consulting', 'icon' => 'briefcase'],
            ['name' => 'Non-Profit', 'icon' => 'heart'],
            ['name' => 'Government', 'icon' => 'landmark'],
            ['name' => 'Aerospace', 'icon' => 'plane'],
            ['name' => 'Automotive', 'icon' => 'car'],
            ['name' => 'Biotechnology', 'icon' => 'dna'],
            ['name' => 'Pharmaceuticals', 'icon' => 'pill'],
            ['name' => 'Insurance', 'icon' => 'shield'],
            ['name' => 'Food & Beverage', 'icon' => 'utensils'],
            ['name' => 'Other', 'icon' => 'ellipsis'],
        ];

        foreach ($industries as $industry) {
            Industry::updateOrCreate(
                ['slug' => Str::slug($industry['name'])],
                [
                    'name' => $industry['name'],
                    'slug' => Str::slug($industry['name']),
                    'icon' => $industry['icon'],
                    'is_active' => true,
                ]
            );
        }
    }
}

