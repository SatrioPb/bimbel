<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Rekap Gaji Guru Les - {{ $data['month_name'] }} {{ $year }}</title>
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
            color: #000000 !important;
        }

        body { font-family: 'Poppins', Arial, sans-serif !important; font-size: 11px; color: #000000; margin: 20px; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000000; padding-bottom: 10px; }
        .header h2 { margin: 0 0 5px 0; color: #000000; font-weight: 800; font-size: 18px; }
        .header p { margin: 0; font-size: 12px; color: #000000; font-weight: 600; }
        
        .summary-card { width: 100%; border: 1px solid #000000; padding: 10px; margin-bottom: 15px; background-color: #f8fafc; }
        .summary-card table { width: 100%; }
        .summary-card td { font-size: 11px; color: #000000; }

        .table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .table th, .table td { border: 1px solid #000000; padding: 6px 8px; text-align: left; color: #000000; }
        .table th { background-color: #f3f4f6; color: #000000; font-weight: bold; }
        .table tr:nth-child(even) { background-color: #ffffff; }

        .total-row td { font-weight: bold; background-color: #f3f4f6; }
        .footer { margin-top: 25px; text-align: right; font-size: 10px; color: #000000; }
    </style>
</head>
<body>
    <div class="header">
        <h2>BIMBEL BINTANG</h2>
        <p>Laporan Rekapitulasi Gaji Guru Les - Periode {{ $data['month_name'] }} {{ $year }}</p>
    </div>

    <div class="summary-card">
        <table>
            <tr>
                <td width="33%"><strong>Bulan & Tahun:</strong> {{ $data['month_name'] }} {{ $year }}</td>
                <td width="33%"><strong>Total Guru Ngajar:</strong> {{ $data['tutors_count'] }} Orang</td>
                <td width="34%"><strong>Total Pengeluaran Gaji:</strong> Rp {{ number_format($data['total_payroll'], 0, ',', '.') }}</td>
            </tr>
        </table>
    </div>

    <table class="table">
        <thead>
            <tr>
                <th width="5%">No</th>
                <th width="12%">NIP / Kode</th>
                <th width="20%">Nama Guru Les</th>
                <th width="25%">Murid Yang Diajar</th>
                <th width="10%">Total Sesi</th>
                <th width="15%">Rincian Kategori</th>
                <th width="13%" style="text-align: right;">Total Gaji (Rp)</th>
            </tr>
        </thead>
        <tbody>
            @forelse($data['tutor_salaries'] as $index => $item)
            <tr>
                <td style="text-align: center;">{{ $index + 1 }}</td>
                <td>{{ $item['nip_code'] }}</td>
                <td><strong>{{ $item['name'] }}</strong></td>
                <td>{{ implode(', ', $item['students_taught']) }}</td>
                <td style="text-align: center;">{{ $item['total_sessions'] }} Sesi</td>
                <td>
                    @foreach($item['category_breakdown'] as $code => $count)
                        <div>{{ $code }}: {{ $count }} Sesi</div>
                    @endforeach
                </td>
                <td style="text-align: right; font-weight: bold;">
                    Rp {{ number_format($item['total_salary'], 0, ',', '.') }}
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="7" style="text-align: center;">Tidak ada sesi mengajar guru les pada periode ini.</td>
            </tr>
            @endforelse
            
            <tr class="total-row">
                <td colspan="6" style="text-align: right;">TOTAL KESELURUHAN REKAP GAJI GURU:</td>
                <td style="text-align: right;">Rp {{ number_format($data['total_payroll'], 0, ',', '.') }}</td>
            </tr>
        </tbody>
    </table>

    <div class="footer">
        Dicetak pada: {{ $printedDate }} WIB
    </div>
</body>
</html>
