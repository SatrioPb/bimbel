<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice Les {{ $invoice->invoice_number }}</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 12px; color: #2d3748; margin: 20px; }
        .invoice-box { border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; }
        .header { margin-bottom: 20px; border-bottom: 2px solid #3182ce; padding-bottom: 15px; }
        .header table { width: 100%; }
        .title { font-size: 22px; font-weight: bold; color: #2b6cb0; margin: 0; }
        .inv-no { font-size: 14px; font-weight: bold; color: #4a5568; margin-top: 5px; }
        .status-badge { display: inline-block; padding: 4px 10px; border-radius: 4px; font-weight: bold; font-size: 11px; text-transform: uppercase; }
        .status-paid { background-color: #c6f6d5; color: #22543d; }
        .status-unpaid { background-color: #fed7d7; color: #742a2a; }
        .section-title { font-weight: bold; font-size: 13px; color: #2b6cb0; border-bottom: 1px solid #cbd5e0; padding-bottom: 5px; margin: 15px 0 10px 0; }
        .info-table { width: 100%; margin-bottom: 20px; }
        .info-table td { padding: 4px 0; font-size: 11px; }
        .items-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .items-table th, .items-table td { border: 1px solid #cbd5e0; padding: 8px; text-align: left; }
        .items-table th { background-color: #ebf8ff; color: #2b6cb0; }
        .summary-table { width: 40%; float: right; margin-top: 15px; border-collapse: collapse; }
        .summary-table td { padding: 6px; text-align: right; }
        .summary-table tr.total td { font-weight: bold; font-size: 14px; color: #2b6cb0; border-top: 2px solid #2b6cb0; }
        .clearfix::after { content: ""; clear: both; display: table; }
        .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 10px; font-size: 10px; color: #718096; text-align: center; }
    </style>
</head>
<body>
    <div class="invoice-box">
        <div class="header">
            <table>
                <tr>
                    <td>
                        <h1 class="title">BIMBEL LEARNING CENTER</h1>
                        <p style="margin: 3px 0; font-size: 11px; color: #718096;">Kuitansi & Invoice Tagihan Les Bulanan</p>
                    </td>
                    <td style="text-align: right;">
                        <div class="inv-no">INVOICE: {{ $invoice->invoice_number }}</div>
                        <div style="margin-top: 5px;">
                            <span class="status-badge {{ $invoice->status === 'paid' ? 'status-paid' : 'status-unpaid' }}">
                                {{ $invoice->status === 'paid' ? 'LUNAS (PAID)' : 'BELUM DIBAYAR (UNPAID)' }}
                            </span>
                        </div>
                    </td>
                </tr>
            </table>
        </div>

        <div class="info-table">
            <table>
                <tr>
                    <td width="15%"><strong>Nama Murid</strong></td>
                    <td width="35%">: {{ $invoice->student->name ?? '-' }} ({{ $invoice->student->student_code ?? '-' }})</td>
                    <td width="15%"><strong>Periode Tagihan</strong></td>
                    <td width="35%">: {{ date('F', mktime(0, 0, 0, $invoice->month, 10)) }} {{ $invoice->year }}</td>
                </tr>
                <tr>
                    <td><strong>Wali Murid</strong></td>
                    <td>: {{ $invoice->student->parent_name ?? '-' }}</td>
                    <td><strong>No. HP/WA</strong></td>
                    <td>: {{ $invoice->student->parent_phone ?? '-' }}</td>
                </tr>
                <tr>
                    <td><strong>Jenis Les</strong></td>
                    <td>: {{ isset($invoice->student) ? strtoupper(str_replace('_', ' ', $invoice->student->jenis_les)) : '-' }}</td>
                    <td><strong>Durasi Per Sesi</strong></td>
                    <td>: {{ $invoice->student->duration_minutes ?? 90 }} Menit</td>
                </tr>
            </table>
        </div>

        <div class="section-title">RINCIAN PERTEMUAN / ABSENSI</div>
        <table class="items-table">
            <thead>
                <tr>
                    <th width="8%">No</th>
                    <th>Deskripsi Layanan Les</th>
                    <th width="15%" style="text-align: center;">Jumlah Sesi</th>
                    <th width="20%" style="text-align: right;">Tarif Per Sesi</th>
                    <th width="20%" style="text-align: right;">Subtotal</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>1</td>
                    <td>
                        Les {{ isset($invoice->student) ? strtoupper(str_replace('_', ' ', $invoice->student->jenis_les)) : 'Regular' }}
                        ({{ $invoice->student->duration_minutes ?? 90 }} Menit) - Periode {{ sprintf('%02d', $invoice->month) }}/{{ $invoice->year }}
                    </td>
                    <td style="text-align: center;">{{ $invoice->total_sessions }} Pertemuan</td>
                    <td style="text-align: right;">Rp {{ number_format($invoice->fee_per_session, 0, ',', '.') }}</td>
                    <td style="text-align: right;">Rp {{ number_format($invoice->total_amount, 0, ',', '.') }}</td>
                </tr>
            </tbody>
        </table>

        <div class="clearfix">
            <table class="summary-table">
                <tr>
                    <td>Subtotal:</td>
                    <td>Rp {{ number_format($invoice->total_amount, 0, ',', '.') }}</td>
                </tr>
                @if($invoice->discount > 0)
                <tr>
                    <td>Potongan/Diskon:</td>
                    <td>- Rp {{ number_format($invoice->discount, 0, ',', '.') }}</td>
                </tr>
                @endif
                <tr class="total">
                    <td>TOTAL:</td>
                    <td>Rp {{ number_format($invoice->final_amount, 0, ',', '.') }}</td>
                </tr>
            </table>
        </div>

        <div class="footer">
            Terima kasih atas kepercayaan Anda bimbingan belajar di Bimbel Learning Center.<br>
            Untuk informasi pembayaran & konfirmasi silakan hubungi Administrasi Bimbel.
        </div>
    </div>
</body>
</html>
