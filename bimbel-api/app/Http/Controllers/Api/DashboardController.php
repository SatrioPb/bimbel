<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Invoice;
use App\Models\LesCategory;
use App\Models\Student;
use App\Models\Tutor;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function summary(Request $request)
    {
        $totalActiveStudents = Student::count();
        $totalTutors = Tutor::count();

        // Rangkuman jumlah absensi per kategori les
        $categories = LesCategory::all();
        $studentsByJenisLes = [];
        $categoriesBreakdown = [];

        foreach ($categories as $cat) {
            $count = Attendance::where('les_category_id', $cat->id)->count();
            $studentsByJenisLes[$cat->code] = $count;

            $prefix = strtoupper(substr($cat->code, 0, 3));
            $studentsByJenisLes[$prefix] = ($studentsByJenisLes[$prefix] ?? 0) + $count;

            $categoriesBreakdown[] = [
                'id' => $cat->id,
                'code' => $cat->code,
                'name' => $cat->name,
                'duration_minutes' => $cat->duration_minutes,
                'fee_per_session' => (float)$cat->fee_per_session,
                'count' => $count
            ];
        }

        // Absensi bulan ini
        $currentMonth = date('m');
        $currentYear = date('Y');

        $user = $request->user();
        $queryAttendanceThisMonth = Attendance::whereMonth('date', $currentMonth)
            ->whereYear('date', $currentYear);

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
                'categories_breakdown' => $categoriesBreakdown,
                'total_active_students' => $totalActiveStudents,
                'total_tutors' => $totalTutors,
                'attendances_this_month' => $attendancesCountThisMonth,
                'income_this_month' => (float)$incomeThisMonth,
            ],
        ]);
    }
}
