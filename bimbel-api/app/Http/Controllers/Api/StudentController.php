<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $query = Student::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('student_code', 'like', "%{$search}%")
                  ->orWhere('parent_name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('jenis_les')) {
            $query->where('jenis_les', $request->jenis_les);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $students = $query->orderBy('name', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => $students,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'parent_name' => 'required|string|max:255',
            'parent_phone' => 'required|string|max:20',
            'address' => 'nullable|string',
            'jenis_les' => 'required|in:reguler,privat_in_house,privat_in_bimbel',
            'duration_minutes' => 'required|integer|in:60,90',
            'fee_per_session' => 'required|numeric|min:0',
            'status' => 'nullable|in:active,inactive',
        ]);

        // Validation for Reguler: fixed 90 minutes
        if ($request->jenis_les === 'reguler' && (int)$request->duration_minutes !== 90) {
            return response()->json([
                'success' => false,
                'message' => 'Jenis les Reguler harus berdurasi 90 menit.',
            ], 422);
        }

        // Generate student code e.g. M2026001
        $latestId = Student::max('id') + 1;
        $studentCode = 'M' . date('Y') . str_pad($latestId, 3, '0', STR_PAD_LEFT);

        $student = Student::create([
            'student_code' => $studentCode,
            'name' => $request->name,
            'parent_name' => $request->parent_name,
            'parent_phone' => $request->parent_phone,
            'address' => $request->address,
            'jenis_les' => $request->jenis_les,
            'duration_minutes' => $request->duration_minutes,
            'fee_per_session' => $request->fee_per_session,
            'status' => $request->status ?? 'active',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Data murid les berhasil ditambahkan.',
            'data' => $student,
        ], 201);
    }

    public function show($id)
    {
        $student = Student::with(['attendances', 'invoices'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $student,
        ]);
    }

    public function update(Request $request, $id)
    {
        $student = Student::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'parent_name' => 'sometimes|required|string|max:255',
            'parent_phone' => 'sometimes|required|string|max:20',
            'address' => 'nullable|string',
            'jenis_les' => 'sometimes|required|in:reguler,privat_in_house,privat_in_bimbel',
            'duration_minutes' => 'sometimes|required|integer|in:60,90',
            'fee_per_session' => 'sometimes|required|numeric|min:0',
            'status' => 'nullable|in:active,inactive',
        ]);

        $jenisLes = $request->jenis_les ?? $student->jenis_les;
        $durationMinutes = $request->duration_minutes ?? $student->duration_minutes;

        if ($jenisLes === 'reguler' && (int)$durationMinutes !== 90) {
            return response()->json([
                'success' => false,
                'message' => 'Jenis les Reguler harus berdurasi 90 menit.',
            ], 422);
        }

        $student->update($request->only([
            'name',
            'parent_name',
            'parent_phone',
            'address',
            'jenis_les',
            'duration_minutes',
            'fee_per_session',
            'status',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Data murid les berhasil diperbarui.',
            'data' => $student,
        ]);
    }

    public function destroy($id)
    {
        $student = Student::findOrFail($id);
        $student->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data murid les berhasil dihapus.',
        ]);
    }
}
