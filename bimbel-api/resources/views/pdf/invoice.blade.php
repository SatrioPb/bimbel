<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice {{ $invoice->invoice_number }}</title>
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
            font-family: 'Poppins', Arial, Helvetica, sans-serif !important;
        }

        @page {
            margin: 25px;
        }
        body {
            font-family: 'Poppins', Arial, Helvetica, sans-serif !important;
            font-size: 11px;
            color: #1f2937;
            background-color: #ffffff;
            margin: 0;
            padding: 10px;
        }
        .container {
            width: 100%;
            margin: 0 auto;
        }
        .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
        }
        .header-table td {
            vertical-align: top;
        }
        .brand-title {
            font-family: 'Poppins', sans-serif;
            font-size: 24px;
            font-weight: 800;
            color: #111827;
            margin: 0 0 6px 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .brand-address {
            font-size: 11px;
            color: #374151;
            line-height: 1.4;
        }
        .recipient-box {
            margin-top: 20px;
            font-size: 11px;
            color: #1f2937;
            line-height: 1.4;
        }
        .recipient-title {
            font-weight: 700;
            text-transform: uppercase;
            color: #111827;
            margin-bottom: 4px;
        }
        .invoice-banner {
            background-color: #555555;
            color: #ffffff;
            font-size: 22px;
            font-weight: 800;
            text-align: center;
            padding: 8px 15px;
            letter-spacing: 2px;
            border-radius: 2px;
        }
        .info-grid {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
        }
        .info-grid td {
            padding: 6px 8px;
            font-size: 11px;
            border-bottom: 1px solid #e5e7eb;
        }
        .info-grid tr td:first-child {
            color: #374151;
            font-weight: 500;
        }
        .info-grid tr td:last-child {
            text-align: right;
            font-weight: 600;
            color: #111827;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        .items-table th {
            background-color: #e5e7eb;
            color: #111827;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 11px;
            padding: 9px 10px;
            border-top: 1.5px solid #4b5563;
            border-bottom: 1.5px solid #4b5563;
        }
        .items-table td {
            padding: 9px 10px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 11px;
        }
        .items-table tr:nth-child(even) {
            background-color: #f9fafb;
        }
        .summary-wrapper {
            margin-top: 20px;
            width: 100%;
        }
        .summary-table {
            width: 45%;
            float: right;
            border-collapse: collapse;
        }
        .summary-table td {
            padding: 6px 10px;
            font-size: 11px;
        }
        .summary-table tr.total-row td {
            font-weight: 700;
            font-size: 13px;
            color: #111827;
            border-top: 2px solid #111827;
            border-bottom: 2px solid #111827;
            background-color: #f3f4f6;
        }
        .clearfix::after {
            content: "";
            clear: both;
            display: table;
        }
        .footer-note {
            margin-top: 45px;
            border-top: 1px dashed #d1d5db;
            padding-top: 12px;
            font-size: 10.5px;
            color: #6b7280;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header Table -->
        <table class="header-table">
            <tr>
                <td width="55%">
                    <div class="brand-title">BIMBEL BINTANG</div>
                    <div class="brand-address">
                        Grogol Tengah RT: 3/4 Bakalankrapyak<br>
                        Kaliwungu Kudus<br>
                        HP: 0888-2538-604
                    </div>

                    <div class="recipient-box">
                        <div class="recipient-title">TAGIHAN KEPADA:</div>
                        <strong>{{ $invoice->student->name ?? '-' }}</strong><br>
                        @if(!empty($invoice->student->parent_name))
                            Wali: {{ $invoice->student->parent_name }}<br>
                        @endif
                        {{ $invoice->student->address ?? 'Alamat tidak diisi' }}<br>
                        {{ $invoice->student->parent_phone ?? '-' }}
                    </div>
                </td>

                <td width="45%">
                    <div class="invoice-banner">INVOICE</div>
                    <table class="info-grid">
                        <tr>
                            <td>Tanggal</td>
                            <td>{{ $printedDate }}</td>
                        </tr>
                        <tr>
                            <td>No.</td>
                            <td>{{ $invoice->invoice_number }}</td>
                        </tr>
                        <tr>
                            <td>Termin</td>
                            <td>{{ $termin ?? '6 hari' }}</td>
                        </tr>
                        <tr>
                            <td>Jatuh Tempo</td>
                            <td>{{ $dueDate }}</td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <!-- Table Rincian Pertemuan Les -->
        <table class="items-table">
            <thead>
                <tr>
                    <th style="text-align: left;">TANGGAL LES</th>
                    <th width="12%" style="text-align: center;">TM</th>
                    <th width="22%" style="text-align: right;">SPP</th>
                    <th width="25%" style="text-align: right;">SUB TOTAL</th>
                </tr>
            </thead>
            <tbody>
                @if(isset($attendances) && count($attendances) > 0)
                    @foreach($attendances as $att)
                        <tr>
                            <td style="text-align: left;">
                                <strong>{{ date('d/m/Y', strtotime($att->date)) }}</strong>
                                @if($att->subject)
                                    - {{ $att->subject }}
                                @endif
                            </td>
                            <td style="text-align: center; font-weight: 700;">
                                {{ $att->lesCategory->code ?? 'LES' }}
                            </td>
                            <td style="text-align: right;">Rp {{ number_format($att->fee_per_session, 0, ',', '.') }}</td>
                            <td style="text-align: right;">Rp {{ number_format($att->fee_per_session, 0, ',', '.') }}</td>
                        </tr>
                    @endforeach
                @else
                    <tr>
                        <td style="text-align: left;">
                            Bimbingan Belajar Les Periode Bulan {{ sprintf('%02d', $invoice->month) }}/{{ $invoice->year }}
                        </td>
                        <td style="text-align: center; font-weight: 700;">
                            {{ $invoice->student->jenis_les ?? 'LES' }}
                        </td>
                        <td style="text-align: right;">Rp {{ number_format($invoice->fee_per_session, 0, ',', '.') }}</td>
                        <td style="text-align: right;">Rp {{ number_format($invoice->total_amount, 0, ',', '.') }}</td>
                    </tr>
                @endif
            </tbody>
        </table>

        <!-- Summary Calculation -->
        <div class="summary-wrapper clearfix">
            <table class="summary-table">
                <tr>
                    <td style="text-align: right; color: #4b5563;">Subtotal ({{ $invoice->total_sessions }} TM):</td>
                    <td style="text-align: right; font-weight: 600;">Rp {{ number_format($invoice->total_amount, 0, ',', '.') }}</td>
                </tr>
                @if($invoice->discount > 0)
                <tr>
                    <td style="text-align: right; color: #dc2626;">Diskon:</td>
                    <td style="text-align: right; color: #dc2626;">- Rp {{ number_format($invoice->discount, 0, ',', '.') }}</td>
                </tr>
                @endif
                <tr class="total-row">
                    <td style="text-align: right;">TOTAL TAGIHAN:</td>
                    <td style="text-align: right;">Rp {{ number_format($invoice->final_amount, 0, ',', '.') }}</td>
                </tr>
            </table>
        </div>

        <!-- Footer Note -->
        <div class="footer-note">
            Pembayaran dapat dilakukan melalui transfer atau tunai paling lambat tanggal <strong>{{ $dueDate }}</strong> (Jatuh Tempo).<br>
            Terima kasih atas kepercayaannya bimbingan belajar di <strong>BIMBEL BINTANG</strong>.
        </div>
    </div>
</body>
</html>
