<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->string('student_code')->unique();
            $table->string('name');
            $table->string('parent_name'); // Nama Wali Murid
            $table->string('parent_phone'); // No HP Wali Murid
            $table->text('address')->nullable();
            $table->enum('jenis_les', ['reguler', 'privat_in_house', 'privat_in_bimbel']);
            $table->integer('duration_minutes')->default(90); // 60 or 90
            $table->decimal('fee_per_session', 12, 2)->default(0);
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
