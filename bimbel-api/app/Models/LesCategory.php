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

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }
}
