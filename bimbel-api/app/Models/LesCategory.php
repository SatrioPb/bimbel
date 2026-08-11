<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LesCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'default_duration',
        'fee_per_session',
    ];

    public static function calculateFixedFee($code, $durationMinutes)
    {
        $c = strtoupper(trim($code));
        $d = (int)$durationMinutes;

        if ($c === 'PIH') {
            return $d === 60 ? 25000 : 30000;
        }

        if ($c === 'PIB') {
            return $d === 60 ? 20000 : 25000;
        }

        if ($c === 'REG') {
            return 15000;
        }

        return 15000;
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }
}
