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

    public static function calculateFixedFee($code, $durationMinutes = 90)
    {
        $c = strtoupper(trim($code));
        $d = (int)$durationMinutes;

        if ($c === 'PIH90' || ($c === 'PIH' && $d === 90)) return 30000;
        if ($c === 'PIH60' || ($c === 'PIH' && $d === 60)) return 25000;
        if ($c === 'PIB90' || ($c === 'PIB' && $d === 90)) return 25000;
        if ($c === 'PIB60' || ($c === 'PIB' && $d === 60)) return 20000;
        if ($c === 'REG') return 15000;

        return 15000;
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }
}
