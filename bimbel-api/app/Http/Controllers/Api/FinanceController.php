<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Invoice;
use App\Models\Student;
use App\Models\Tutor;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class FinanceController extends Controller
{
    // List Invoice Tagihan
    public function invoices(Request $request)
    {
        $query = Invoice::with('student');

        if ($request->filled('month')) {
            $query->where('month', (int)$request->month);
        }

        if ($request->filled('year')) {
            $query->where('year', (int)$request->year);
        }

        if ($request->filled('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $invoices = $query->orderBy('year', 'desc')->orderBy('month', 'desc')->orderBy('id', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $invoices,
        ]);
    }

    // Auto-generate Invoices for month/year based on attendances (Active Students Only)
    public function generateInvoices(Request $request)
    {
        $request->validate([
            'month' => 'required|integer|between:1,12',
            'year' => 'required|integer|min:2020|max:2099',
        ]);

        $month = (int)$request->month;
        $year = (int)$request->year;

        // Only fetch student IDs who have attendance records in this month & year
        $activeStudentIds = Attendance::whereMonth('date', $month)
            ->whereYear('date', $year)
            ->distinct()
            ->pluck('student_id');

        if ($activeStudentIds->isEmpty()) {
            return response()->json([
                'success' => true,
                'message' => "Tidak ada sesi les murid yang dicatat pada periode " . sprintf('%02d', $month) . "/{$year}. Tidak ada invoice yang digenerate.",
            ]);
        }

        $activeStudents = Student::whereIn('id', $activeStudentIds)->get();
        $generatedCount = 0;

        foreach ($activeStudents as $student) {
            // Count attendances for student in this month/year
            $attendances = Attendance::where('student_id', $student->id)
                ->whereMonth('date', $month)
                ->whereYear('date', $year)
                ->get();

            $totalSessions = $attendances->count();
            if ($totalSessions === 0) {
                continue;
            }

            $feePerSession = (float)$attendances->first()->fee_per_session;
            $totalAmount = (float)$attendances->sum('fee_per_session');
            $discount = 0;
            $finalAmount = max(0, $totalAmount - $discount);

            // Find existing invoice or generate a unique invoice number
            $existingInvoice = Invoice::where('student_id', $student->id)
                ->where('month', $month)
                ->where('year', $year)
                ->first();

            if ($existingInvoice) {
                $invoiceNumber = $existingInvoice->invoice_number;
                $status = $existingInvoice->status; // retain existing status
            } else {
                $seq = Invoice::where('year', $year)->where('month', $month)->count() + 1;
                $invoiceNumber = 'INV/' . $year . '/' . sprintf('%02d', $month) . '/' . sprintf('%03d', $seq);
                while (Invoice::where('invoice_number', $invoiceNumber)->exists()) {
                    $seq++;
                    $invoiceNumber = 'INV/' . $year . '/' . sprintf('%02d', $month) . '/' . sprintf('%03d', $seq);
                }
                $status = 'unpaid';
            }

            Invoice::updateOrCreate(
                [
                    'student_id' => $student->id,
                    'month' => $month,
                    'year' => $year,
                ],
                [
                    'invoice_number' => $invoiceNumber,
                    'total_sessions' => $totalSessions,
                    'fee_per_session' => $feePerSession,
                    'total_amount' => $totalAmount,
                    'discount' => $discount,
                    'final_amount' => $finalAmount,
                    'status' => $status,
                ]
            );

            $generatedCount++;
        }

        return response()->json([
            'success' => true,
            'message' => "Berhasil memproses {$generatedCount} invoice tagihan les untuk murid aktif periode " . sprintf('%02d', $month) . "/{$year}.",
        ]);
    }

    public function show($id)
    {
        $invoice = Invoice::with('student')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $invoice,
        ]);
    }

    public function markPaid(Request $request, $id)
    {
        $invoice = Invoice::findOrFail($id);

        $status = $request->input('status', 'paid');
        $request->merge(['status' => $status]);

        $request->validate([
            'status' => 'required|in:paid,unpaid',
            'discount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $discount = $request->has('discount') ? (float)$request->discount : $invoice->discount;
        $finalAmount = max(0, $invoice->total_amount - $discount);

        $invoice->update([
            'status' => $status,
            'discount' => $discount,
            'final_amount' => $finalAmount,
            'paid_at' => $status === 'paid' ? now() : null,
            'notes' => $request->notes ?? $invoice->notes,
        ]);

        $invoice->load('student');

        return response()->json([
            'success' => true,
            'message' => 'Status pembayaran invoice berhasil diperbarui.',
            'data' => $invoice,
        ]);
    }

    // Export single invoice to PDF
    public function invoicePdf($id)
    {
        $invoice = Invoice::with('student')->findOrFail($id);

        $attendances = Attendance::where('student_id', $invoice->student_id)
            ->whereMonth('date', $invoice->month)
            ->whereYear('date', $invoice->year)
            ->orderBy('date', 'asc')
            ->get();

        $monthsIndo = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
        ];

        $printedCarbon = \Carbon\Carbon::now();
        $dueCarbon = $printedCarbon->copy()->addDays(2);

        $printedDateFormatted = $printedCarbon->format('d') . ' ' . ($monthsIndo[(int)$printedCarbon->format('m')] ?? '') . ' ' . $printedCarbon->format('Y');
        $dueDateFormatted = $dueCarbon->format('d') . ' ' . ($monthsIndo[(int)$dueCarbon->format('m')] ?? '') . ' ' . $dueCarbon->format('Y');

        $pdf = Pdf::loadView('pdf.invoice', [
            'invoice' => $invoice,
            'attendances' => $attendances,
            'printedDate' => $printedDateFormatted,
            'dueDate' => $dueDateFormatted,
            'termin' => '2 hari'
        ]);
        $pdf->setOption('isRemoteEnabled', true);
        $pdf->setOption('isFontSubsettingEnabled', true);

        $safeInvoiceNo = str_replace(['/', '\\'], '_', $invoice->invoice_number);
        return $pdf->download('Invoice_' . $safeInvoiceNo . '.pdf');
    }

    // Export Invoices List to Excel
    public function invoicesExcel(Request $request)
    {
        $query = Invoice::with('student');

        if ($request->filled('month')) {
            $query->where('month', (int)$request->month);
        }

        if ($request->filled('year')) {
            $query->where('year', (int)$request->year);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $invoices = $query->orderBy('year', 'desc')->orderBy('month', 'desc')->get();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Rekap Invoice Keuangan');

        // Header
        $sheet->setCellValue('A1', 'No');
        $sheet->setCellValue('B1', 'No Invoice');
        $sheet->setCellValue('C1', 'Bulan / Tahun');
        $sheet->setCellValue('D1', 'Nama Murid');
        $sheet->setCellValue('E1', 'Wali Murid');
        $sheet->setCellValue('F1', 'Jumlah Sesi');
        $sheet->setCellValue('G1', 'Tarif Per Sesi');
        $sheet->setCellValue('H1', 'Total Tagihan');
        $sheet->setCellValue('I1', 'Tagihan Akhir');
        $sheet->setCellValue('J1', 'Status');

        $row = 2;
        foreach ($invoices as $index => $item) {
            $sheet->setCellValue('A' . $row, $index + 1);
            $sheet->setCellValue('B' . $row, $item->invoice_number);
            $sheet->setCellValue('C' . $row, sprintf('%02d', $item->month) . '/' . $item->year);
            $sheet->setCellValue('D' . $row, $item->student->name ?? '');
            $sheet->setCellValue('E' . $row, $item->student->parent_name ?? '');
            $sheet->setCellValue('F' . $row, $item->total_sessions);
            $sheet->setCellValue('G' . $row, $item->fee_per_session);
            $sheet->setCellValue('H' . $row, $item->total_amount);
            $sheet->setCellValue('I' . $row, $item->final_amount);
            $sheet->setCellValue('J' . $row, strtoupper($item->status));
            $row++;
        }

        $fileName = 'Rekap_Invoice_Keuangan_' . date('Ymd_His') . '.xlsx';
        $writer = new Xlsx($spreadsheet);
        $tempPath = storage_path('app/' . $fileName);
        $writer->save($tempPath);

        return response()->download($tempPath, $fileName)->deleteFileAfterSend(true);
    }

    // Total Pemasukan Les Per Bulan Summary
    public function incomeSummary(Request $request)
    {
        $year = (int)($request->year ?? date('Y'));

        $monthlyReport = [];
        $months = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
        ];

        foreach ($months as $m => $monthName) {
            $invoices = Invoice::with('student')->where('year', $year)->where('month', $m)->get();
            $income = $invoices->where('status', 'paid')->sum('final_amount');
            $paidCount = $invoices->where('status', 'paid')->count();
            $totalCount = $invoices->count();

            $studentInvoices = [];
            foreach ($invoices as $inv) {
                $studentInvoices[] = [
                    'id' => $inv->id,
                    'invoice_number' => $inv->invoice_number,
                    'student_code' => $inv->student->student_code ?? '-',
                    'student_name' => $inv->student->name ?? 'Murid Tidak Ditemukan',
                    'parent_name' => $inv->student->parent_name ?? '-',
                    'total_sessions' => $inv->total_sessions,
                    'fee_per_session' => (float)$inv->fee_per_session,
                    'total_amount' => (float)$inv->total_amount,
                    'discount' => (float)$inv->discount,
                    'final_amount' => (float)$inv->final_amount,
                    'status' => $inv->status,
                ];
            }

            $monthlyReport[] = [
                'month' => $m,
                'month_name' => $monthName,
                'total_invoices_count' => $totalCount,
                'paid_invoices_count' => $paidCount,
                'income' => (float)$income,
                'student_invoices' => $studentInvoices,
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'year' => $year,
                'total_income' => array_sum(array_column($monthlyReport, 'income')),
                'monthly_report' => $monthlyReport,
            ],
        ]);
    }

    public function incomeSummaryPdf(Request $request)
    {
        $year = (int)($request->year ?? date('Y'));
        $data = $this->incomeSummary($request)->getData(true)['data'];

        $pdf = Pdf::loadView('pdf.income_summary', [
            'year' => $year,
            'monthlyReport' => $data['monthly_report'],
            'totalIncome' => $data['total_income'],
        ]);
        $pdf->setOption('isRemoteEnabled', true);
        $pdf->setOption('isFontSubsettingEnabled', true);

        return $pdf->download('Laporan_Pemasukan_Keuangan_' . $year . '.pdf');
    }

    public function incomeSummaryExcel(Request $request)
    {
        $year = (int)($request->year ?? date('Y'));
        $data = $this->incomeSummary($request)->getData(true)['data'];

        $spreadsheet = new Spreadsheet();

        // Sheet 1: Rekap Pemasukan Bulanan
        $sheet1 = $spreadsheet->getActiveSheet();
        $sheet1->setTitle('Rekap Pemasukan');

        $sheet1->setCellValue('A1', 'No');
        $sheet1->setCellValue('B1', 'Bulan');
        $sheet1->setCellValue('C1', 'Total Invoice');
        $sheet1->setCellValue('D1', 'Invoice Lunas');
        $sheet1->setCellValue('E1', 'Total Pemasukan (Rp)');

        $row1 = 2;
        foreach ($data['monthly_report'] as $index => $item) {
            $sheet1->setCellValue('A' . $row1, $index + 1);
            $sheet1->setCellValue('B' . $row1, $item['month_name']);
            $sheet1->setCellValue('C' . $row1, $item['total_invoices_count']);
            $sheet1->setCellValue('D' . $row1, $item['paid_invoices_count']);
            $sheet1->setCellValue('E' . $row1, $item['income']);
            $row1++;
        }

        // Total Summary Row on Sheet 1
        $sheet1->setCellValue('A' . $row1, 'TOTAL PEMASUKAN');
        $sheet1->setCellValue('E' . $row1, $data['total_income']);

        // Sheet 2: Rincian Total Invoice Per Murid Per Bulan
        $sheet2 = $spreadsheet->createSheet();
        $sheet2->setTitle('Rincian Invoice Murid');
        
        $sheet2->setCellValue('A1', 'No');
        $sheet2->setCellValue('B1', 'Bulan');
        $sheet2->setCellValue('C1', 'No. Invoice');
        $sheet2->setCellValue('D1', 'Kode Murid');
        $sheet2->setCellValue('E1', 'Nama Murid');
        $sheet2->setCellValue('F1', 'Wali Murid');
        $sheet2->setCellValue('G1', 'Jumlah Sesi');
        $sheet2->setCellValue('H1', 'Tarif / Sesi (Rp)');
        $sheet2->setCellValue('I1', 'Total Tagihan (Rp)');
        $sheet2->setCellValue('J1', 'Tagihan Akhir (Rp)');
        $sheet2->setCellValue('K1', 'Status');

        $row2 = 2;
        $studentCounter = 1;
        $grandStudentFinalTotal = 0;

        foreach ($data['monthly_report'] as $item) {
            if (!empty($item['student_invoices'])) {
                foreach ($item['student_invoices'] as $inv) {
                    $sheet2->setCellValue('A' . $row2, $studentCounter++);
                    $sheet2->setCellValue('B' . $row2, $item['month_name']);
                    $sheet2->setCellValue('C' . $row2, $inv['invoice_number']);
                    $sheet2->setCellValue('D' . $row2, $inv['student_code']);
                    $sheet2->setCellValue('E' . $row2, $inv['student_name']);
                    $sheet2->setCellValue('F' . $row2, $inv['parent_name']);
                    $sheet2->setCellValue('G' . $row2, $inv['total_sessions']);
                    $sheet2->setCellValue('H' . $row2, $inv['fee_per_session']);
                    $sheet2->setCellValue('I' . $row2, $inv['total_amount']);
                    $sheet2->setCellValue('J' . $row2, $inv['final_amount']);
                    $sheet2->setCellValue('K' . $row2, strtoupper($inv['status'] === 'paid' ? 'LUNAS' : 'BELUM LUNAS'));

                    $grandStudentFinalTotal += $inv['final_amount'];
                    $row2++;
                }
            }
        }

        // Total Tagihan Murid Overall on Sheet 2
        $sheet2->setCellValue('A' . $row2, 'TOTAL TAGIHAN KESELURUHAN');
        $sheet2->setCellValue('J' . $row2, $grandStudentFinalTotal);

        // Set active sheet index to first sheet
        $spreadsheet->setActiveSheetIndex(0);

        $fileName = 'Laporan_Pemasukan_Keuangan_' . $year . '_' . date('Ymd_His') . '.xlsx';
        $writer = new Xlsx($spreadsheet);
        $tempPath = storage_path('app/' . $fileName);
        $writer->save($tempPath);

        return response()->download($tempPath, $fileName)->deleteFileAfterSend(true);
    }

    // Rekap Gaji Guru Les per Bulan
    public function tutorSalaries(Request $request)
    {
        $month = (int)($request->month ?? date('m'));
        $year = (int)($request->year ?? date('Y'));

        $monthsIndo = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
        ];

        // Fetch all attendances for the selected month and year
        $attendances = Attendance::with(['tutor', 'student', 'lesCategory'])
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->get();

        // Group attendances by tutor_id
        $grouped = $attendances->groupBy('tutor_id');

        $tutorSalaries = [];
        $totalPayroll = 0;

        foreach ($grouped as $tutorId => $items) {
            $tutor = $items->first()->tutor;
            if (!$tutor) continue;

            $studentsTaught = $items->pluck('student.name')->filter()->unique()->values()->toArray();
            $totalSessions = $items->count();

            // Breakdown by category code
            $categoryBreakdown = [];
            foreach ($items as $item) {
                $catCode = $item->lesCategory->code ?? 'REG';
                if (!isset($categoryBreakdown[$catCode])) {
                    $categoryBreakdown[$catCode] = 0;
                }
                $categoryBreakdown[$catCode]++;
            }

            $totalSalary = (float)$items->sum('tutor_fee_per_session');
            $totalPayroll += $totalSalary;

            $tutorSalaries[] = [
                'tutor_id' => $tutor->id,
                'nip_code' => $tutor->nip_code,
                'name' => $tutor->name,
                'phone' => $tutor->phone,
                'specialization' => $tutor->specialization,
                'students_taught' => $studentsTaught,
                'students_count' => count($studentsTaught),
                'total_sessions' => $totalSessions,
                'category_breakdown' => $categoryBreakdown,
                'total_salary' => $totalSalary,
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'month' => $month,
                'month_name' => $monthsIndo[$month] ?? '',
                'year' => $year,
                'total_payroll' => $totalPayroll,
                'tutors_count' => count($tutorSalaries),
                'tutor_salaries' => $tutorSalaries,
            ],
        ]);
    }

    public function tutorSalariesPdf(Request $request)
    {
        $month = (int)($request->month ?? date('m'));
        $year = (int)($request->year ?? date('Y'));

        $data = $this->tutorSalaries($request)->getData(true)['data'];

        $pdf = Pdf::loadView('pdf.tutor_salary_summary', [
            'data' => $data,
            'month' => $month,
            'year' => $year,
            'printedDate' => date('d/m/Y H:i')
        ]);
        $pdf->setOption('isRemoteEnabled', true);
        $pdf->setOption('isFontSubsettingEnabled', true);

        return $pdf->download('Rekap_Gaji_Guru_' . sprintf('%02d', $month) . '_' . $year . '.pdf');
    }

    public function tutorSalariesExcel(Request $request)
    {
        $month = (int)($request->month ?? date('m'));
        $year = (int)($request->year ?? date('Y'));
        $data = $this->tutorSalaries($request)->getData(true)['data'];

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Rekap Gaji Guru ' . sprintf('%02d', $month) . '-' . $year);

        // Header
        $sheet->setCellValue('A1', 'No');
        $sheet->setCellValue('B1', 'NIP/Kode');
        $sheet->setCellValue('C1', 'Nama Guru Les');
        $sheet->setCellValue('D1', 'Murid Yang Diajar');
        $sheet->setCellValue('E1', 'Total Sesi');
        $sheet->setCellValue('F1', 'Rincian Sesi per Kategori');
        $sheet->setCellValue('G1', 'Total Gaji Guru (Rp)');

        $row = 2;
        foreach ($data['tutor_salaries'] as $index => $item) {
            $studentsStr = implode(', ', $item['students_taught']);
            
            $catBreakdownArr = [];
            foreach ($item['category_breakdown'] as $code => $count) {
                $catBreakdownArr[] = "{$code}: {$count} sesi";
            }
            $catStr = implode(' | ', $catBreakdownArr);

            $sheet->setCellValue('A' . $row, $index + 1);
            $sheet->setCellValue('B' . $row, $item['nip_code']);
            $sheet->setCellValue('C' . $row, $item['name']);
            $sheet->setCellValue('D' . $row, $studentsStr);
            $sheet->setCellValue('E' . $row, $item['total_sessions']);
            $sheet->setCellValue('F' . $row, $catStr);
            $sheet->setCellValue('G' . $row, $item['total_salary']);
            $row++;
        }

        // Total
        $sheet->setCellValue('A' . $row, 'TOTAL REKAP GAJI');
        $sheet->setCellValue('G' . $row, $data['total_payroll']);

        $fileName = 'Rekap_Gaji_Guru_' . sprintf('%02d', $month) . '_' . $year . '_' . date('Ymd_His') . '.xlsx';
        $writer = new Xlsx($spreadsheet);
        $tempPath = storage_path('app/' . $fileName);
        $writer->save($tempPath);

        return response()->download($tempPath, $fileName)->deleteFileAfterSend(true);
    }

    // Export PDF Slip Gaji Individual Guru Les
    public function tutorIndividualSalaryPdf(Request $request, $tutorId)
    {
        $month = (int)($request->month ?? date('m'));
        $year = (int)($request->year ?? date('Y'));

        $tutor = Tutor::findOrFail($tutorId);

        $monthsIndo = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
        ];

        $attendances = Attendance::with(['student', 'lesCategory'])
            ->where('tutor_id', $tutorId)
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->orderBy('date', 'asc')
            ->get();

        $totalSalary = (float)$attendances->sum(function ($att) {
            if ($att->tutor_fee_per_session && (float)$att->tutor_fee_per_session > 0) {
                return (float)$att->tutor_fee_per_session;
            }
            return (float)($att->lesCategory->tutor_fee_per_session ?? 15000);
        });

        $pdf = Pdf::loadView('pdf.tutor_individual_salary_slip', [
            'tutor' => $tutor,
            'attendances' => $attendances,
            'month' => $month,
            'monthName' => $monthsIndo[$month] ?? '',
            'year' => $year,
            'totalSalary' => $totalSalary,
            'printedDate' => date('d/m/Y H:i')
        ]);
        $pdf->setOption('isRemoteEnabled', true);
        $pdf->setOption('isFontSubsettingEnabled', true);

        $cleanName = str_replace(' ', '_', preg_replace('/[^A-Za-z0-9\- ]/', '', $tutor->name));

        return $pdf->download('Slip_Gaji_' . $cleanName . '_' . sprintf('%02d', $month) . '_' . $year . '.pdf');
    }
}
