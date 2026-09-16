<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Pemasukan Les Per Bulan</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');

        @font-face {
            font-family: 'Poppins';
            font-style: normal;
            font-weight: 400;
            src: url('https://fonts.gstatic.com/s/poppins/v20/pxiEyp8kv8JHgFVrJJfedw.ttf') format('truetype');
        }
        @font-face {
            font-family: 'Poppins';
            font-style: normal;
            font-weight: 600;
            src: url('https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLEj6Z1xlEw.ttf') format('truetype');
        }
        @font-face {
            font-family: 'Poppins';
            font-style: normal;
            font-weight: 700;
            src: url('https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLCz7Z1xlEw.ttf') format('truetype');
        }

        * {
            font-family: 'Poppins', Arial, sans-serif !important;
        }

        body { font-family: 'Poppins', Arial, sans-serif !important; font-size: 12px; color: #333; margin: 20px; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #2b6cb0; padding-bottom: 10px; }
        .header h2 { margin: 0 0 5px 0; color: #2b6cb0; }
        .header p { margin: 0; font-size: 11px; color: #666; }
        .table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        .table th, .table td { border: 1px solid #cbd5e0; padding: 8px; text-align: left; }
        .table th { background-color: #ebf8ff; color: #2b6cb0; font-weight: bold; }
        .table tr:nth-child(even) { background-color: #f7fafc; }
        .table tr.grand-total td { font-weight: bold; font-size: 13px; background-color: #e2e8f0; color: #2b6cb0; }
        .text-right { text-align: right; }
        .footer { margin-top: 30px; text-align: right; font-size: 11px; color: #718096; }
    </style>
</head>
<body>
    <div class="header">
        <div style="margin-bottom: 8px; text-align: center;">
            @if(file_exists(public_path('images/logo_bimbel.png')))
                <img src="data:image/png;base64,{{ base64_encode(file_get_contents(public_path('images/logo_bimbel.png'))) }}" style="height: 50px; width: auto; margin-right: 15px; vertical-align: middle;" alt="Logo Bimbel Bintang">
            @endif
            @if(file_exists(public_path('images/logo_ahe.png')))
                <img src="data:image/png;base64,{{ base64_encode(file_get_contents(public_path('images/logo_ahe.png'))) }}" style="height: 50px; width: auto; vertical-align: middle;" alt="Logo AHE">
            @endif
        </div>
        <h2>BIMBEL BINTANG</h2>
        <p style="font-size: 11px; color: #4b5563; font-weight: 500; margin-bottom: 3px;">Grogol Tengah RT 3 RW 4, Bakalan Krapyak, Kaliwungu, Kudus | HP: 0858-7688-7059</p>
        <p style="font-weight: 700;">Laporan Rekapitulasi Pemasukan Keuangan Les Per Bulan (Tahun {{ $year }})</p>
    </div>

    <table class="table">
        <thead>
            <tr>
                <th width="8%">No</th>
                <th width="20%">Bulan</th>
                <th width="20%" class="text-right">Total Invoice</th>
                <th width="24%" class="text-right">Invoice Lunas</th>
                <th width="28%" class="text-right">Total Pemasukan (Rp)</th>
            </tr>
        </thead>
        <tbody>
            @php $grandTotal = 0; $totalPaidCount = 0; $totalInvCount = 0; @endphp
            @foreach($monthlyReport as $index => $row)
            @php 
                $grandTotal += $row['income'];
                $totalPaidCount += $row['paid_invoices_count'];
                $totalInvCount += $row['total_invoices_count'];
            @endphp
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ $row['month_name'] }}</td>
                <td class="text-right">{{ $row['total_invoices_count'] }} Invoice</td>
                <td class="text-right">{{ $row['paid_invoices_count'] }} Invoice</td>
                <td class="text-right">Rp {{ number_format($row['income'], 0, ',', '.') }}</td>
            </tr>
            @endforeach
            <tr class="grand-total">
                <td colspan="2">TOTAL KESELURUHAN</td>
                <td class="text-right">{{ $totalInvCount }} Invoice</td>
                <td class="text-right">{{ $totalPaidCount }} Invoice</td>
                <td class="text-right">Rp {{ number_format($grandTotal, 0, ',', '.') }}</td>
            </tr>
        </tbody>
    </table>

    <!-- Rincian Total Invoice Per Murid Per Bulan -->
    <div style="margin-top: 30px;">
        <h3 style="margin-bottom: 12px; color: #2b6cb0; border-bottom: 2px solid #2b6cb0; padding-bottom: 4px; font-size: 13px; font-weight: 700; text-transform: uppercase;">
            RINCIAN TOTAL INVOICE PER MURID PER BULAN (TAHUN {{ $year }})
        </h3>

        @php $hasAnyInvoices = false; @endphp
        @foreach($monthlyReport as $row)
            @if(isset($row['student_invoices']) && count($row['student_invoices']) > 0)
                @php $hasAnyInvoices = true; @endphp
                <div style="margin-top: 15px; margin-bottom: 6px;">
                    <strong style="font-size: 11.5px; color: #1a202c; text-transform: uppercase;">
                        📅 BULAN {{ $row['month_name'] }} {{ $year }}
                        <span style="font-weight: normal; font-size: 10.5px; color: #4a5568;">
                            ({{ $row['total_invoices_count'] }} Invoice | {{ $row['paid_invoices_count'] }} Lunas)
                        </span>
                    </strong>
                </div>

                <table class="table" style="margin-top: 4px; margin-bottom: 15px;">
                    <thead>
                        <tr>
                            <th width="5%">No</th>
                            <th width="20%">No. Invoice</th>
                            <th width="23%">Nama Murid</th>
                            <th width="17%">Wali Murid</th>
                            <th width="10%" style="text-align: center;">Sesi</th>
                            <th width="14%" class="text-right">Total Tagihan</th>
                            <th width="11%" style="text-align: center;">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        @php $monthSubtotal = 0; @endphp
                        @foreach($row['student_invoices'] as $idx => $inv)
                        @php $monthSubtotal += $inv['final_amount']; @endphp
                        <tr>
                            <td style="text-align: center;">{{ $idx + 1 }}</td>
                            <td><strong>{{ $inv['invoice_number'] }}</strong></td>
                            <td>{{ $inv['student_name'] }}</td>
                            <td>{{ $inv['parent_name'] }}</td>
                            <td style="text-align: center;">{{ $inv['total_sessions'] }} Sesi</td>
                            <td class="text-right" style="font-weight: 600;">
                                Rp {{ number_format($inv['final_amount'], 0, ',', '.') }}
                            </td>
                            <td style="text-align: center; font-weight: bold; color: {{ $inv['status'] === 'paid' ? '#2f855a' : '#c53030' }};">
                                {{ strtoupper($inv['status'] === 'paid' ? 'LUNAS' : 'BELUM') }}
                            </td>
                        </tr>
                        @endforeach
                        <tr style="background-color: #ebf8ff; font-weight: bold;">
                            <td colspan="5" style="text-align: right; color: #2b6cb0;">TOTAL TAGIHAN {{ strtoupper($row['month_name']) }}:</td>
                            <td class="text-right" style="color: #2b6cb0;">
                                Rp {{ number_format($monthSubtotal, 0, ',', '.') }}
                            </td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>
            @endif
        @endforeach

        @if(!$hasAnyInvoices)
            <p style="text-align: center; color: #718096; margin-top: 15px;">Belum ada data invoice murid pada tahun {{ $year }}.</p>
        @endif
    </div>

    <div class="footer">
        Dicetak pada: {{ date('d/m/Y H:i') }} WIB
    </div>
</body>
</html>
