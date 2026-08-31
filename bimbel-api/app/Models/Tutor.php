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
        return $this->hasMany(TutorCategoryRate::class, 'tutor_id');
    }

    public function getCategoryRatesAttribute()
    {
        $rates = [];
        if ($this->relationLoaded('categoryRates')) {
            $relation = $this->getRelation('categoryRates');
            if ($relation) {
                foreach ($relation as $rate) {
                    $rates[$rate->les_category_id] = (float)$rate->rate_per_session;
                }
            }
        } elseif ($this->exists) {
            try {
                $categoryRates = $this->categoryRates()->get();
                foreach ($categoryRates as $rate) {
                    $rates[$rate->les_category_id] = (float)$rate->rate_per_session;
                }
            } catch (\Throwable $e) {
                // fallback
            }
        }
        return $rates;
    }
}
