<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('les_categories', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // e.g. PIB, PIH, REG
            $table->string('name'); // e.g. Privat In Bimbel, Privat In House, Reguler
            $table->integer('default_duration')->default(90); // 60 or 90
            $table->decimal('fee_per_session', 12, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('les_categories');
    }
};
