<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Riwayat Absensi Mengajar Guru Les</title>
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

        body { font-family: 'Poppins', Arial, sans-serif !important; font-size: 12px; color: #000000; margin: 20px; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000000; padding-bottom: 10px; }
        .header h2 { margin: 0 0 5px 0; color: #000000; font-weight: 800; font-size: 20px; }
        .header p { margin: 0; font-size: 12px; color: #000000; font-weight: 600; }
        .info { margin-bottom: 15px; }
        .info table { width: 100%; border-collapse: collapse; }
        .info td { padding: 4px; font-size: 11px; color: #000000; }
        .table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .table th, .table td { border: 1px solid #000000; padding: 7px 10px; text-align: left; color: #000000; }
        .table th { background-color: #f3f4f6; color: #000000; font-weight: bold; }
        .table tr:nth-child(even) { background-color: #ffffff; }
        .footer { margin-top: 30px; text-align: right; font-size: 11px; color: #000000; }
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
        <p style="font-size: 11px; color: #000000; font-weight: 500; margin-bottom: 3px;">Grogol Tengah RT 3 RW 4, Bakalan Krapyak, Kaliwungu, Kudus | HP: 0858-7688-7059</p>
        <p style="font-weight: 700;">Laporan Riwayat Mengajar Guru Les</p>
    </div>

    @if(isset($tutor))
    <div class="info">
        <table>
            <tr>
                <td width="15%"><strong>Nama Guru</strong></td>
                <td width="35%">: {{ $tutor->name }}</td>
                <td width="15%"><strong>Spesialisasi</strong></td>
                <td width="35%">: {{ $tutor->specialization ?? '-' }}</td>
            </tr>
            <tr>
                <td><strong>NIP / Kode</strong></td>
                <td>: {{ $tutor->nip_code ?? '-' }}</td>
                <td><strong>No. HP</strong></td>
                <td>: {{ $tutor->phone ?? '-' }}</td>
            </tr>
        </table>
    </div>
    @endif

    <table class="table">
        <thead>
            <tr>
                <th width="5%">No</th>
                <th width="14%">Tanggal</th>
                <th width="20%">Murid Les</th>
                <th width="20%">Guru Les</th>
                <th width="12%">Jenis Les</th>
                <th width="14%">Catatan</th>
                <th width="15%" style="text-align: right;">Gaji Guru (Honor)</th>
            </tr>
        </thead>
        <tbody>
            @php $totalSalary = 0; @endphp
            @forelse($attendances as $index => $item)
            @php
                $fee = ($item->tutor_fee_per_session && (float)$item->tutor_fee_per_session > 0)
                    ? (float)$item->tutor_fee_per_session
                    : (float)($item->lesCategory->tutor_fee_per_session ?? 15000);
                $totalSalary += $fee;
            @endphp
            <tr>
                <td style="text-align: center;">{{ $index + 1 }}</td>
                <td>{{ \Carbon\Carbon::parse($item->date)->format('d/m/Y') }}</td>
                <td>{{ $item->student->name ?? '-' }}</td>
                <td>{{ $item->tutor->name ?? '-' }}</td>
                <td>{{ $item->lesCategory->code ?? $item->lesCategory->name ?? '-' }}</td>
                <td>{{ $item->notes ?: '-' }}</td>
                <td style="text-align: right; font-weight: bold;">
                    Rp {{ number_format($fee, 0, ',', '.') }}
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="7" style="text-align: center; color: #000000;">Tidak ada data riwayat mengajar.</td>
            </tr>
            @endforelse
        </tbody>
        @if(count($attendances) > 0)
        <tfoot>
            <tr style="background-color: #f8fafc;">
                <td colspan="6" style="text-align: right; font-weight: bold;">TOTAL GAJI GURU LES:</td>
                <td style="text-align: right; font-weight: bold; font-size: 13px;">
                    Rp {{ number_format($totalSalary, 0, ',', '.') }}
                </td>
            </tr>
        </tfoot>
        @endif
    </table>

    <div class="footer">
        Dicetak pada: {{ date('d/m/Y H:i') }} WIB
    </div>
</body>
</html>
