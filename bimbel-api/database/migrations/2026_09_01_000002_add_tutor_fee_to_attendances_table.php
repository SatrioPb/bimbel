<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            if (!Schema::hasColumn('attendances', 'tutor_fee_per_session')) {
                $table->decimal('tutor_fee_per_session', 12, 2)->default(0)->after('fee_per_session');
            }
        });
    }

    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            if (Schema::hasColumn('attendances', 'tutor_fee_per_session')) {
                $table->dropColumn('tutor_fee_per_session');
            }
        });
    }
};
