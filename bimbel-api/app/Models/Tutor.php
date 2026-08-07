<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tutor extends Model
{
    use HasFactory;

    protected $fillable = [
        'nip_code',
        'name',
        'phone',
        'specialization',
        'rate_per_session',
    ];

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }
}
