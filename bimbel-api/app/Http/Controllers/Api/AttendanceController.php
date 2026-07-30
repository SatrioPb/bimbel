<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Student;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Attendance::with(['tutor', 'student']);

        // Guru can only see their own attendances by default unless filtering
        if ($user->role === 'guru') {
            $query->where('tutor_id', $user->id);
        } elseif ($request->filled('tutor_id')) {
            $query->where('tutor_id', $request->tutor_id);
        }

        if ($request->filled('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        if ($request->filled('date')) {
            $query->whereDate('date', $request->date);
        }

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('date', [$request->start_date, $request->end_date]);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $attendances = $query->orderBy('date', 'desc')->orderBy('id', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $attendances,
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'student_id' => 'required|exists:students,id',
            'tutor_id' => 'nullable|exists:users,id',
            'date' => 'required|date',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i',
            'duration_minutes' => 'required|integer|in:60,90',
            'subject' => 'required|string|max:255',
            'topic' => 'nullable|string',
            'status' => 'required|in:hadir,izin,sakit,alpha',
            'notes' => 'nullable|string',
        ]);

        $tutorId = $user->role === 'guru' ? $user->id : ($request->tutor_id ?? $user->id);

        $student = Student::findOrFail($request->student_id);

        // Validation for student duration rule if specified
        if ($student->jenis_les === 'reguler' && (int)$request->duration_minutes !== 90) {
            return response()->json([
                'success' => false,
                'message' => 'Durasi absensi untuk jenis les Reguler harus 90 menit.',
            ], 422);
        }

        $attendance = Attendance::create([
            'tutor_id' => $tutorId,
            'student_id' => $request->student_id,
            'date' => $request->date,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'duration_minutes' => $request->duration_minutes,
            'subject' => $request->subject,
            'topic' => $request->topic,
            'status' => $request->status,
            'notes' => $request->notes,
        ]);

        $attendance->load(['tutor', 'student']);

        return response()->json([
            'success' => true,
            'message' => 'Absensi berhasil dicatat.',
            'data' => $attendance,
        ], 201);
    }

    public function show($id)
    {
        $attendance = Attendance::with(['tutor', 'student'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $attendance,
        ]);
    }

    public function update(Request $request, $id)
    {
        $attendance = Attendance::findOrFail($id);
        $user = $request->user();

        // Guru can only update their own attendance records
        if ($user->role === 'guru' && $attendance->tutor_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses untuk mengubah absensi ini.',
            ], 403);
        }

        $request->validate([
            'date' => 'sometimes|required|date',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i',
            'duration_minutes' => 'sometimes|required|integer|in:60,90',
            'subject' => 'sometimes|required|string|max:255',
            'topic' => 'nullable|string',
            'status' => 'sometimes|required|in:hadir,izin,sakit,alpha',
            'notes' => 'nullable|string',
        ]);

        $attendance->update($request->only([
            'date',
            'start_time',
            'end_time',
            'duration_minutes',
            'subject',
            'topic',
            'status',
            'notes',
        ]));

        $attendance->load(['tutor', 'student']);

        return response()->json([
            'success' => true,
            'message' => 'Data absensi berhasil diperbarui.',
            'data' => $attendance,
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya Admin yang dapat menghapus data absensi.',
            ], 403);
        }

        $attendance = Attendance::findOrFail($id);
        $attendance->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data absensi berhasil dihapus.',
        ]);
    }
}
