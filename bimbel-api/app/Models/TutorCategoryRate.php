<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TutorCategoryRate extends Model
{
    use HasFactory;

    protected $fillable = [
        'tutor_id',
        'les_category_id',
        'rate_per_session',
    ];

    public function tutor()
    {
        return $this->belongsTo(Tutor::class);
    }

    public function lesCategory()
    {
        return $this->belongsTo(LesCategory::class);
    }
}
