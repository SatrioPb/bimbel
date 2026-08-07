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
        ]);

        // Generate student code e.g. M2026001
        $latestId = Student::max('id') + 1;
        $studentCode = 'M' . date('Y') . str_pad($latestId, 3, '0', STR_PAD_LEFT);

        $student = Student::create([
            'student_code' => $studentCode,
            'name' => $request->name,
            'parent_name' => $request->parent_name,
            'parent_phone' => $request->parent_phone,
            'address' => $request->address,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Data murid les berhasil ditambahkan.',
            'data' => $student,
        ], 201);
    }

    public function show($id)
    {
        $student = Student::with(['attendances.lesCategory', 'attendances.tutor', 'invoices'])->findOrFail($id);

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
        ]);

        $student->update($request->only([
            'name',
            'parent_name',
            'parent_phone',
            'address',
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
