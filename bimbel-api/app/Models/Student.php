<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_code',
        'name',
        'parent_name',
        'parent_phone',
        'address',
        'jenis_les',
        'duration_minutes',
        'fee_per_session',
        'status',
    ];

    protected $casts = [
        'duration_minutes' => 'integer',
        'fee_per_session' => 'decimal:2',
    ];

    public function attendances()
    {
        return $this->hasMany(Attendance::class, 'student_id');
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class, 'student_id');
    }
}
