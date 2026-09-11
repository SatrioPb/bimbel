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

    <div class="footer">
        Dicetak pada: {{ date('d/m/Y H:i') }} WIB
    </div>
</body>
</html>
