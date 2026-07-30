<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Student;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class ReportController extends Controller
{
    // 1. Riwayat Absensi Murid Les
    public function studentHistory(Request $request)
    {
        $query = Attendance::with(['student', 'tutor']);

        if ($request->filled('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        if ($request->filled('jenis_les')) {
            $query->whereHas('student', function ($q) use ($request) {
                $q->where('jenis_les', $request->jenis_les);
            });
        }

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('date', [$request->start_date, $request->end_date]);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $attendances = $query->orderBy('date', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $attendances,
        ]);
    }

    public function studentHistoryPdf(Request $request)
    {
        $query = Attendance::with(['student', 'tutor']);
        $student = null;

        if ($request->filled('student_id')) {
            $query->where('student_id', $request->student_id);
            $student = Student::find($request->student_id);
        }

        if ($request->filled('jenis_les')) {
            $query->whereHas('student', function ($q) use ($request) {
                $q->where('jenis_les', $request->jenis_les);
            });
        }

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('date', [$request->start_date, $request->end_date]);
        }

        $attendances = $query->orderBy('date', 'desc')->get();

        $pdf = Pdf::loadView('pdf.student_history', [
            'attendances' => $attendances,
            'student' => $student,
        ]);

        return $pdf->download('Riwayat_Absensi_Murid_' . date('Ymd_His') . '.pdf');
    }

    public function studentHistoryExcel(Request $request)
    {
        $query = Attendance::with(['student', 'tutor']);

        if ($request->filled('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        if ($request->filled('jenis_les')) {
            $query->whereHas('student', function ($q) use ($request) {
                $q->where('jenis_les', $request->jenis_les);
            });
        }

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('date', [$request->start_date, $request->end_date]);
        }

        $attendances = $query->orderBy('date', 'desc')->get();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Riwayat Absensi Murid');

        // Header
        $sheet->setCellValue('A1', 'No');
        $sheet->setCellValue('B1', 'Tanggal');
        $sheet->setCellValue('C1', 'Kode Murid');
        $sheet->setCellValue('D1', 'Nama Murid');
        $sheet->setCellValue('E1', 'Jenis Les');
        $sheet->setCellValue('F1', 'Guru Les');
        $sheet->setCellValue('G1', 'Mata Pelajaran');
        $sheet->setCellValue('H1', 'Durasi (Menit)');
        $sheet->setCellValue('I1', 'Status');
        $sheet->setCellValue('J1', 'Catatan');

        $row = 2;
        foreach ($attendances as $index => $item) {
            $sheet->setCellValue('A' . $row, $index + 1);
            $sheet->setCellValue('B' . $row, $item->date);
            $sheet->setCellValue('C' . $row, $item->student->student_code ?? '');
            $sheet->setCellValue('D' . $row, $item->student->name ?? '');
            $sheet->setCellValue('E' . $row, isset($item->student) ? strtoupper($item->student->jenis_les) : '');
            $sheet->setCellValue('F' . $row, $item->tutor->name ?? '');
            $sheet->setCellValue('G' . $row, $item->subject);
            $sheet->setCellValue('H' . $row, $item->duration_minutes);
            $sheet->setCellValue('I' . $row, strtoupper($item->status));
            $sheet->setCellValue('J' . $row, $item->notes ?? '');
            $row++;
        }

        $fileName = 'Riwayat_Absensi_Murid_' . date('Ymd_His') . '.xlsx';
        $writer = new Xlsx($spreadsheet);
        $tempPath = storage_path('app/' . $fileName);
        $writer->save($tempPath);

        return response()->download($tempPath, $fileName)->deleteFileAfterSend(true);
    }

    // 2. Riwayat Absensi Guru Les
    public function tutorHistory(Request $request)
    {
        $user = $request->user();
        $query = Attendance::with(['student', 'tutor']);

        if ($user->role === 'guru') {
            $query->where('tutor_id', $user->id);
        } elseif ($request->filled('tutor_id')) {
            $query->where('tutor_id', $request->tutor_id);
        }

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('date', [$request->start_date, $request->end_date]);
        }

        $attendances = $query->orderBy('date', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $attendances,
        ]);
    }

    public function tutorHistoryPdf(Request $request)
    {
        $user = $request->user();
        $query = Attendance::with(['student', 'tutor']);
        $tutor = null;

        $tutorId = $user->role === 'guru' ? $user->id : $request->tutor_id;

        if ($tutorId) {
            $query->where('tutor_id', $tutorId);
            $tutor = User::with('tutorProfile')->find($tutorId);
        }

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('date', [$request->start_date, $request->end_date]);
        }

        $attendances = $query->orderBy('date', 'desc')->get();

        $pdf = Pdf::loadView('pdf.tutor_history', [
            'attendances' => $attendances,
            'tutor' => $tutor,
        ]);

        return $pdf->download('Riwayat_Mengajar_Guru_' . date('Ymd_His') . '.pdf');
    }

    public function tutorHistoryExcel(Request $request)
    {
        $user = $request->user();
        $query = Attendance::with(['student', 'tutor']);

        $tutorId = $user->role === 'guru' ? $user->id : $request->tutor_id;

        if ($tutorId) {
            $query->where('tutor_id', $tutorId);
        }

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('date', [$request->start_date, $request->end_date]);
        }

        $attendances = $query->orderBy('date', 'desc')->get();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Riwayat Mengajar Guru');

        // Header
        $sheet->setCellValue('A1', 'No');
        $sheet->setCellValue('B1', 'Tanggal');
        $sheet->setCellValue('C1', 'Nama Guru');
        $sheet->setCellValue('D1', 'Nama Murid');
        $sheet->setCellValue('E1', 'Jenis Les');
        $sheet->setCellValue('F1', 'Mata Pelajaran');
        $sheet->setCellValue('G1', 'Durasi (Menit)');
        $sheet->setCellValue('H1', 'Status');
        $sheet->setCellValue('I1', 'Materi/Topik');

        $row = 2;
        foreach ($attendances as $index => $item) {
            $sheet->setCellValue('A' . $row, $index + 1);
            $sheet->setCellValue('B' . $row, $item->date);
            $sheet->setCellValue('C' . $row, $item->tutor->name ?? '');
            $sheet->setCellValue('D' . $row, $item->student->name ?? '');
            $sheet->setCellValue('E' . $row, isset($item->student) ? strtoupper($item->student->jenis_les) : '');
            $sheet->setCellValue('F' . $row, $item->subject);
            $sheet->setCellValue('G' . $row, $item->duration_minutes);
            $sheet->setCellValue('H' . $row, strtoupper($item->status));
            $sheet->setCellValue('I' . $row, $item->topic ?? '');
            $row++;
        }

        $fileName = 'Riwayat_Mengajar_Guru_' . date('Ymd_His') . '.xlsx';
        $writer = new Xlsx($spreadsheet);
        $tempPath = storage_path('app/' . $fileName);
        $writer->save($tempPath);

        return response()->download($tempPath, $fileName)->deleteFileAfterSend(true);
    }
}
