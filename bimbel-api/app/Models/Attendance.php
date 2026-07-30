<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'tutor_id',
        'student_id',
        'date',
        'start_time',
        'end_time',
        'duration_minutes',
        'subject',
        'topic',
        'status',
        'notes',
    ];

    protected $casts = [
        'date' => 'date:Y-m-d',
        'duration_minutes' => 'integer',
    ];

    public function tutor()
    {
        return $this->belongsTo(User::class, 'tutor_id');
    }

    public function student()
    {
        return $this->belongsTo(Student::class, 'student_id');
    }
}
