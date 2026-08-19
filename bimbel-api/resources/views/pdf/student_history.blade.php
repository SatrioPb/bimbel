<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Riwayat Absensi Murid Les</title>
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
        .info { margin-bottom: 15px; }
        .info table { width: 100%; border-collapse: collapse; }
        .info td { padding: 4px; font-size: 11px; }
        .table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .table th, .table td { border: 1px solid #cbd5e0; padding: 6px 8px; text-align: left; }
        .table th { background-color: #ebf8ff; color: #2b6cb0; font-weight: bold; }
        .table tr:nth-child(even) { background-color: #f7fafc; }
        .badge { padding: 3px 6px; border-radius: 3px; font-size: 10px; font-weight: bold; color: #fff; display: inline-block; }
        .bg-hadir { background-color: #38a169; }
        .bg-izin { background-color: #d69e2e; }
        .bg-sakit { background-color: #3182ce; }
        .bg-alpha { background-color: #e53e3e; }
        .footer { margin-top: 30px; text-align: right; font-size: 11px; color: #718096; }
    </style>
</head>
<body>
    <div class="header">
        <h2>BIMBEL BINTANG</h2>
        <p>Laporan Riwayat Absensi Murid Les</p>
    </div>

    @if(isset($student))
    <div class="info">
        <table>
            <tr>
                <td width="15%"><strong>Kode Murid</strong></td>
                <td width="35%">: {{ $student->student_code }}</td>
                <td width="15%"><strong>Jenis Les</strong></td>
                <td width="35%">: {{ strtoupper(str_replace('_', ' ', $student->jenis_les)) }} ({{ $student->duration_minutes }} Menit)</td>
            </tr>
            <tr>
                <td><strong>Nama Murid</strong></td>
                <td>: {{ $student->name }}</td>
                <td><strong>Wali Murid</strong></td>
                <td>: {{ $student->parent_name }} ({{ $student->parent_phone }})</td>
            </tr>
        </table>
    </div>
    @endif

    <table class="table">
        <thead>
            <tr>
                <th width="5%">No</th>
                <th width="12%">Tanggal</th>
                <th width="20%">Murid</th>
                <th width="18%">Guru Les</th>
                <th width="15%">Mata Pelajaran</th>
                <th width="10%">Durasi</th>
                <th width="10%">Status</th>
                <th width="10%">Catatan</th>
            </tr>
        </thead>
        <tbody>
            @forelse($attendances as $index => $item)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ \Carbon\Carbon::parse($item->date)->format('d/m/Y') }}</td>
                <td>{{ $item->student->name ?? '-' }}</td>
                <td>{{ $item->tutor->name ?? '-' }}</td>
                <td>{{ $item->subject }}</td>
                <td>{{ $item->duration_minutes }} Mns</td>
                <td>
                    <span class="badge bg-{{ strtolower($item->status) }}">
                        {{ strtoupper($item->status) }}
                    </span>
                </td>
                <td>{{ $item->notes ?? '-' }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="8" style="text-align: center; color: #a0aec0;">Tidak ada data riwayat absensi.</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        Dicetak pada: {{ date('d/m/Y H:i') }} WIB
    </div>
</body>
</html>
