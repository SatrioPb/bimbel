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

    protected $appends = ['category_rates'];

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    public function categoryRates()
    {
        return $this->hasMany(TutorCategoryRate::class);
    }

    public function getCategoryRatesAttribute()
    {
        $rates = [];
        if ($this->relationLoaded('categoryRates')) {
            foreach ($this->categoryRates as $rate) {
                $rates[$rate->les_category_id] = (float)$rate->rate_per_session;
            }
        } else {
            foreach ($this->categoryRates()->get() as $rate) {
                $rates[$rate->les_category_id] = (float)$rate->rate_per_session;
            }
        }
        return $rates;
    }
}
