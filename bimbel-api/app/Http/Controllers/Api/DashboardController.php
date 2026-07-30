<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Invoice;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function summary(Request $request)
    {
        // 1. Rangkuman jumlah murid les dibagi per jenis les
        $studentsByJenisLes = [
            'reguler' => Student::where('jenis_les', 'reguler')->where('status', 'active')->count(),
            'privat_in_house' => Student::where('jenis_les', 'privat_in_house')->where('status', 'active')->count(),
            'privat_in_bimbel' => Student::where('jenis_les', 'privat_in_bimbel')->where('status', 'active')->count(),
        ];

        // Rincian durasi per jenis les
        $studentsByJenisLesAndDuration = [
            'reguler_90' => Student::where('jenis_les', 'reguler')->where('duration_minutes', 90)->where('status', 'active')->count(),
            'privat_in_house_60' => Student::where('jenis_les', 'privat_in_house')->where('duration_minutes', 60)->where('status', 'active')->count(),
            'privat_in_house_90' => Student::where('jenis_les', 'privat_in_house')->where('duration_minutes', 90)->where('status', 'active')->count(),
            'privat_in_bimbel_60' => Student::where('jenis_les', 'privat_in_bimbel')->where('duration_minutes', 60)->where('status', 'active')->count(),
            'privat_in_bimbel_90' => Student::where('jenis_les', 'privat_in_bimbel')->where('duration_minutes', 90)->where('status', 'active')->count(),
        ];

        $totalActiveStudents = Student::where('status', 'active')->count();
        $totalTutors = User::where('role', 'guru')->where('status', 'active')->count();

        // Absensi bulan ini
        $currentMonth = date('m');
        $currentYear = date('Y');

        $user = $request->user();
        $queryAttendanceThisMonth = Attendance::whereMonth('date', $currentMonth)
            ->whereYear('date', $currentYear);

        if ($user && $user->role === 'guru') {
            $queryAttendanceThisMonth->where('tutor_id', $user->id);
        }

        $attendancesCountThisMonth = $queryAttendanceThisMonth->count();

        // Pendapatan bulan ini (Only for admin)
        $incomeThisMonth = 0;
        if ($user && $user->role === 'admin') {
            $incomeThisMonth = Invoice::where('month', (int)$currentMonth)
                ->where('year', (int)$currentYear)
                ->where('status', 'paid')
                ->sum('final_amount');
        }

        return response()->json([
            'success' => true,
            'message' => 'Data ringkasan dashboard berhasil dimuat.',
            'data' => [
                'students_by_jenis_les' => $studentsByJenisLes,
                'students_by_jenis_les_and_duration' => $studentsByJenisLesAndDuration,
                'total_active_students' => $totalActiveStudents,
                'total_tutors' => $totalTutors,
                'attendances_this_month' => $attendancesCountThisMonth,
                'income_this_month' => $incomeThisMonth,
            ],
        ]);
    }
}
