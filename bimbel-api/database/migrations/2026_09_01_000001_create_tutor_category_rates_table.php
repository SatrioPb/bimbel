<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tutor_category_rates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tutor_id')->constrained('tutors')->onDelete('cascade');
            $table->foreignId('les_category_id')->constrained('les_categories')->onDelete('cascade');
            $table->decimal('rate_per_session', 12, 2)->default(0);
            $table->timestamps();

            $table->unique(['tutor_id', 'les_category_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tutor_category_rates');
    }
};
