<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Invoice;
use App\Models\Student;
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
        $dueCarbon = $printedCarbon->copy()->addDays(6);

        $printedDateFormatted = $printedCarbon->format('d') . ' ' . ($monthsIndo[(int)$printedCarbon->format('m')] ?? '') . ' ' . $printedCarbon->format('Y');
        $dueDateFormatted = $dueCarbon->format('d') . ' ' . ($monthsIndo[(int)$dueCarbon->format('m')] ?? '') . ' ' . $dueCarbon->format('Y');

        $pdf = Pdf::loadView('pdf.invoice', [
            'invoice' => $invoice,
            'attendances' => $attendances,
            'printedDate' => $printedDateFormatted,
            'dueDate' => $dueDateFormatted,
            'termin' => '6 hari'
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
        $sheet->setCellValue('I1', 'Diskon');
        $sheet->setCellValue('J1', 'Tagihan Akhir');
        $sheet->setCellValue('K1', 'Status');

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
            $sheet->setCellValue('I' . $row, $item->discount);
            $sheet->setCellValue('J' . $row, $item->final_amount);
            $sheet->setCellValue('K' . $row, strtoupper($item->status));
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
            $invoices = Invoice::where('year', $year)->where('month', $m)->get();
            $income = $invoices->where('status', 'paid')->sum('final_amount');
            $paidCount = $invoices->where('status', 'paid')->count();
            $totalCount = $invoices->count();

            $monthlyReport[] = [
                'month' => $m,
                'month_name' => $monthName,
                'total_invoices_count' => $totalCount,
                'paid_invoices_count' => $paidCount,
                'income' => (float)$income,
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
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Laporan Pemasukan ' . $year);

        // Header
        $sheet->setCellValue('A1', 'No');
        $sheet->setCellValue('B1', 'Bulan');
        $sheet->setCellValue('C1', 'Total Invoice');
        $sheet->setCellValue('D1', 'Invoice Lunas');
        $sheet->setCellValue('E1', 'Total Pemasukan (Rp)');

        $row = 2;
        foreach ($data['monthly_report'] as $index => $item) {
            $sheet->setCellValue('A' . $row, $index + 1);
            $sheet->setCellValue('B' . $row, $item['month_name']);
            $sheet->setCellValue('C' . $row, $item['total_invoices_count']);
            $sheet->setCellValue('D' . $row, $item['paid_invoices_count']);
            $sheet->setCellValue('E' . $row, $item['income']);
            $row++;
        }

        // Total
        $sheet->setCellValue('A' . $row, 'TOTAL');
        $sheet->setCellValue('E' . $row, $data['total_income']);

        $fileName = 'Laporan_Pemasukan_Keuangan_' . $year . '_' . date('Ymd_His') . '.xlsx';
        $writer = new Xlsx($spreadsheet);
        $tempPath = storage_path('app/' . $fileName);
        $writer->save($tempPath);

        return response()->download($tempPath, $fileName)->deleteFileAfterSend(true);
    }
}
