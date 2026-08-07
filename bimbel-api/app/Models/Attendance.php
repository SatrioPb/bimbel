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
        'les_category_id',
        'date',
        'start_time',
        'end_time',
        'duration_minutes',
        'subject',
        'fee_per_session',
        'notes',
    ];

    public function tutor()
    {
        return $this->belongsTo(Tutor::class);
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function lesCategory()
    {
        return $this->belongsTo(LesCategory::class, 'les_category_id');
    }
}
