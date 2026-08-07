<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\LesCategory;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $query = Attendance::with(['tutor', 'student', 'lesCategory']);

        if ($request->filled('tutor_id')) {
            $query->where('tutor_id', $request->tutor_id);
        }

        if ($request->filled('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        if ($request->filled('month')) {
            $query->whereMonth('date', (int)$request->month);
        }

        if ($request->filled('year')) {
            $query->whereYear('date', (int)$request->year);
        }

        $attendances = $query->orderBy('date', 'desc')->orderBy('id', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $attendances,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'tutor_id' => 'required|exists:tutors,id',
            'student_id' => 'required|exists:students,id',
            'les_category_id' => 'required|exists:les_categories,id',
            'date' => 'required|date',
            'start_time' => 'nullable|string',
            'end_time' => 'nullable|string',
            'duration_minutes' => 'required|integer|in:60,90',
            'subject' => 'nullable|string|max:255', // Mata Pelajaran Optional
            'notes' => 'nullable|string',
        ]);

        $category = LesCategory::find($request->les_category_id);
        $feePerSession = $category ? $category->fee_per_session : 0;

        $attendance = Attendance::create([
            'tutor_id' => $request->tutor_id,
            'student_id' => $request->student_id,
            'les_category_id' => $request->les_category_id,
            'date' => $request->date,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'duration_minutes' => $request->duration_minutes,
            'subject' => $request->subject,
            'fee_per_session' => $feePerSession,
            'notes' => $request->notes,
        ]);

        $attendance->load(['tutor', 'student', 'lesCategory']);

        return response()->json([
            'success' => true,
            'message' => 'Presensi mengajar berhasil dicatat.',
            'data' => $attendance,
        ], 201);
    }

    public function show($id)
    {
        $attendance = Attendance::with(['tutor', 'student', 'lesCategory'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $attendance,
        ]);
    }

    public function update(Request $request, $id)
    {
        $attendance = Attendance::findOrFail($id);

        $request->validate([
            'tutor_id' => 'sometimes|required|exists:tutors,id',
            'student_id' => 'sometimes|required|exists:students,id',
            'les_category_id' => 'sometimes|required|exists:les_categories,id',
            'date' => 'sometimes|required|date',
            'start_time' => 'nullable|string',
            'end_time' => 'nullable|string',
            'duration_minutes' => 'sometimes|required|integer|in:60,90',
            'subject' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        if ($request->filled('les_category_id')) {
            $category = LesCategory::find($request->les_category_id);
            $feePerSession = $category ? $category->fee_per_session : $attendance->fee_per_session;
        } else {
            $feePerSession = $attendance->fee_per_session;
        }

        $attendance->update([
            'tutor_id' => $request->tutor_id ?? $attendance->tutor_id,
            'student_id' => $request->student_id ?? $attendance->student_id,
            'les_category_id' => $request->les_category_id ?? $attendance->les_category_id,
            'date' => $request->date ?? $attendance->date,
            'start_time' => $request->start_time ?? $attendance->start_time,
            'end_time' => $request->end_time ?? $attendance->end_time,
            'duration_minutes' => $request->duration_minutes ?? $attendance->duration_minutes,
            'subject' => $request->subject ?? $attendance->subject,
            'fee_per_session' => $feePerSession,
            'notes' => $request->notes ?? $attendance->notes,
        ]);

        $attendance->load(['tutor', 'student', 'lesCategory']);

        return response()->json([
            'success' => true,
            'message' => 'Presensi mengajar berhasil diperbarui.',
            'data' => $attendance,
        ]);
    }

    public function destroy($id)
    {
        $attendance = Attendance::findOrFail($id);
        $attendance->delete();

        return response()->json([
            'success' => true,
            'message' => 'Presensi mengajar berhasil dihapus.',
        ]);
    }
}
