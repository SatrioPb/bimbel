<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Slip Gaji Guru Les - {{ $tutor->name }} - {{ $monthName }} {{ $year }}</title>
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
        
        .profile-card { width: 100%; border: 1px solid #000000; padding: 12px; margin-bottom: 15px; background-color: #f8fafc; }
        .profile-card table { width: 100%; border-collapse: collapse; }
        .profile-card td { font-size: 11px; color: #000000; padding: 3px 0; border: none; }

        .table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .table th, .table td { border: 1px solid #000000; padding: 6px 8px; text-align: left; color: #000000; }
        .table th { background-color: #f3f4f6; color: #000000; font-weight: bold; }

        .total-box { margin-top: 15px; border: 1.5px solid #000000; padding: 10px 15px; text-align: right; background-color: #f8fafc; }
        .total-box span { font-size: 12px; font-weight: bold; }
        .total-box strong { font-size: 14px; font-weight: 800; }

        .signature-table { width: 100%; margin-top: 35px; border: none; border-collapse: collapse; }
        .signature-table td { text-align: center; border: none; font-size: 11px; }

        .footer { margin-top: 25px; text-align: right; font-size: 10px; color: #000000; }
    </style>
</head>
<body>
    <div class="header">
        <h2>BIMBEL BINTANG</h2>
        <p>SLIP GAJI / HONORARIUM MENGAJAR GURU LES</p>
    </div>

    <div class="profile-card">
        <table>
            <tr>
                <td width="15%"><strong>Nama Guru</strong></td>
                <td width="35%">: {{ $tutor->name }}</td>
                <td width="20%"><strong>Periode Gaji</strong></td>
                <td width="30%">: {{ $monthName }} {{ $year }}</td>
            </tr>
            <tr>
                <td><strong>NIP / Kode</strong></td>
                <td>: {{ $tutor->nip_code }}</td>
                <td><strong>Total Sesi Mengajar</strong></td>
                <td>: {{ count($attendances) }} Sesi</td>
            </tr>
            <tr>
                <td><strong>Spesialisasi</strong></td>
                <td>: {{ $tutor->specialization ?: '-' }}</td>
                <td><strong>No. Telepon / WA</strong></td>
                <td>: {{ $tutor->phone ?: '-' }}</td>
            </tr>
        </table>
    </div>

    <table class="table">
        <thead>
            <tr>
                <th width="5%">No</th>
                <th width="14%">Tanggal</th>
                <th width="22%">Nama Murid</th>
                <th width="18%">Kategori Les</th>
                <th width="21%">Mata Pelajaran</th>
                <th width="10%">Durasi</th>
                <th width="10%" style="text-align: right;">Honor (Rp)</th>
            </tr>
        </thead>
        <tbody>
            @forelse($attendances as $index => $att)
            @php
                $fee = ($att->tutor_fee_per_session && (float)$att->tutor_fee_per_session > 0)
                    ? (float)$att->tutor_fee_per_session
                    : (float)($att->lesCategory->tutor_fee_per_session ?? 15000);
            @endphp
            <tr>
                <td style="text-align: center;">{{ $index + 1 }}</td>
                <td>{{ $att->date }}</td>
                <td><strong>{{ $att->student->name ?? '-' }}</strong></td>
                <td>{{ $att->lesCategory->code ?? '-' }} - {{ $att->lesCategory->name ?? '' }}</td>
                <td>{{ $att->subject ?: '-' }}</td>
                <td style="text-align: center;">{{ $att->duration_minutes }} Mnt</td>
                <td style="text-align: right; font-weight: bold;">
                    Rp {{ number_format($fee, 0, ',', '.') }}
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="7" style="text-align: center;">Tidak ada data sesi mengajar pada periode ini.</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="total-box">
        <span>TOTAL GAJI / HONORARIUM YANG DITERIMA: </span>
        <strong>Rp {{ number_format($totalSalary, 0, ',', '.') }}</strong>
    </div>

    <table class="signature-table">
        <tr>
            <td width="50%">
                Disetujui Oleh,<br>
                <strong>Admin Keuangan Bimbel</strong>
                <br><br><br><br>
                ( _________________________ )
            </td>
            <td width="50%">
                Penerima,<br>
                <strong>Guru Les</strong>
                <br><br><br><br>
                ( <strong>{{ $tutor->name }}</strong> )
            </td>
        </tr>
    </table>

    <div class="footer">
        Dicetak otomatis oleh Sistem Bimbel Bintang pada: {{ $printedDate }} WIB
    </div>
</body>
</html>
