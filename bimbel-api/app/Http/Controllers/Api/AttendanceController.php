<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\LesCategory;
use App\Models\Tutor;
use App\Models\TutorCategoryRate;
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
            'duration_minutes' => 'nullable|integer',
            'subject' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $category = LesCategory::find($request->les_category_id);
        $duration = $request->filled('duration_minutes') ? (int)$request->duration_minutes : ($category ? $category->default_duration : 90);
        $feePerSession = $category ? (float)$category->fee_per_session : 15000;

        // Calculate Tutor Fee per session for this category
        $tutorCategoryRate = TutorCategoryRate::where('tutor_id', $request->tutor_id)
            ->where('les_category_id', $request->les_category_id)
            ->first();

        if ($tutorCategoryRate && $tutorCategoryRate->rate_per_session > 0) {
            $tutorFee = (float)$tutorCategoryRate->rate_per_session;
        } elseif ($category && $category->tutor_fee_per_session > 0) {
            $tutorFee = (float)$category->tutor_fee_per_session;
        } else {
            $tutor = Tutor::find($request->tutor_id);
            $tutorFee = $tutor ? (float)($tutor->rate_per_session ?: $feePerSession) : $feePerSession;
        }

        $attendance = Attendance::create([
            'tutor_id' => $request->tutor_id,
            'student_id' => $request->student_id,
            'les_category_id' => $request->les_category_id,
            'date' => $request->date,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'duration_minutes' => $duration,
            'subject' => $request->subject,
            'fee_per_session' => $feePerSession,
            'tutor_fee_per_session' => $tutorFee,
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
            'duration_minutes' => 'nullable|integer',
            'subject' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $tutorId = $request->input('tutor_id', $attendance->tutor_id);
        $categoryId = $request->input('les_category_id', $attendance->les_category_id);

        $category = LesCategory::find($categoryId);
        $duration = $request->filled('duration_minutes') ? (int)$request->duration_minutes : ($category ? $category->default_duration : $attendance->duration_minutes);
        $feePerSession = $category ? (float)$category->fee_per_session : $attendance->fee_per_session;

        // Calculate Tutor Fee per session for this category
        $tutorCategoryRate = TutorCategoryRate::where('tutor_id', $tutorId)
            ->where('les_category_id', $categoryId)
            ->first();

        if ($tutorCategoryRate && $tutorCategoryRate->rate_per_session > 0) {
            $tutorFee = (float)$tutorCategoryRate->rate_per_session;
        } elseif ($category && $category->tutor_fee_per_session > 0) {
            $tutorFee = (float)$category->tutor_fee_per_session;
        } else {
            $tutor = Tutor::find($tutorId);
            $tutorFee = $tutor ? (float)($tutor->rate_per_session ?: $feePerSession) : $feePerSession;
        }

        $attendance->update([
            'tutor_id' => $tutorId,
            'student_id' => $request->student_id ?? $attendance->student_id,
            'les_category_id' => $categoryId,
            'date' => $request->date ?? $attendance->date,
            'start_time' => $request->start_time ?? $attendance->start_time,
            'end_time' => $request->end_time ?? $attendance->end_time,
            'duration_minutes' => $duration,
            'subject' => $request->subject ?? $attendance->subject,
            'fee_per_session' => $feePerSession,
            'tutor_fee_per_session' => $tutorFee,
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
