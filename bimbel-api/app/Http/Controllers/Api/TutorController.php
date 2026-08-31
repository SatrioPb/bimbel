<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tutor;
use App\Models\TutorCategoryRate;
use Illuminate\Http\Request;

class TutorController extends Controller
{
    public function index(Request $request)
    {
        $query = Tutor::with('categoryRates');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('nip_code', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $tutors = $query->orderBy('name', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => $tutors,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'specialization' => 'nullable|string|max:255',
            'category_rates' => 'nullable|array',
        ]);

        $latestTutorId = Tutor::max('id') + 1;
        $nipCode = 'G' . date('Y') . str_pad($latestTutorId, 3, '0', STR_PAD_LEFT);

        $tutor = Tutor::create([
            'nip_code' => $nipCode,
            'name' => $request->name,
            'phone' => $request->phone,
            'specialization' => $request->specialization,
            'rate_per_session' => 15000,
        ]);

        if ($request->filled('category_rates') && is_array($request->category_rates)) {
            foreach ($request->category_rates as $catId => $rate) {
                if ($rate !== null && $rate !== '') {
                    TutorCategoryRate::updateOrCreate(
                        ['tutor_id' => $tutor->id, 'les_category_id' => $catId],
                        ['rate_per_session' => (float)$rate]
                    );
                }
            }
        }

        $tutor->load('categoryRates');

        return response()->json([
            'success' => true,
            'message' => 'Data guru les berhasil ditambahkan.',
            'data' => $tutor,
        ], 201);
    }

    public function show($id)
    {
        $tutor = Tutor::with(['categoryRates', 'attendances.student'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $tutor,
        ]);
    }

    public function update(Request $request, $id)
    {
        $tutor = Tutor::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'specialization' => 'nullable|string|max:255',
            'category_rates' => 'nullable|array',
        ]);

        $tutor->update($request->only([
            'name',
            'phone',
            'specialization',
        ]));

        if ($request->has('category_rates') && is_array($request->category_rates)) {
            foreach ($request->category_rates as $catId => $rate) {
                if ($rate !== null && $rate !== '') {
                    TutorCategoryRate::updateOrCreate(
                        ['tutor_id' => $tutor->id, 'les_category_id' => $catId],
                        ['rate_per_session' => (float)$rate]
                    );
                }
            }
        }

        $tutor->load('categoryRates');

        return response()->json([
            'success' => true,
            'message' => 'Data guru les berhasil diperbarui.',
            'data' => $tutor,
        ]);
    }

    public function destroy($id)
    {
        $tutor = Tutor::findOrFail($id);
        $tutor->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data guru les berhasil dihapus.',
        ]);
    }
}
