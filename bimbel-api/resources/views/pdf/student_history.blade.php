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
        <h2>BIMBEL BINTANG</h2>
        <p>Laporan Riwayat Absensi Murid Les</p>
    </div>

    @if(isset($student))
    <div class="info">
        <table>
            <tr>
                <td width="15%"><strong>Kode Murid</strong></td>
                <td width="35%">: {{ $student->student_code }}</td>
                <td width="15%"><strong>Nama Murid</strong></td>
                <td width="35%">: {{ $student->name }}</td>
            </tr>
            <tr>
                <td><strong>Wali Murid</strong></td>
                <td>: {{ $student->parent_name }} ({{ $student->parent_phone }})</td>
                <td><strong>Alamat</strong></td>
                <td>: {{ $student->address ?? '-' }}</td>
            </tr>
        </table>
    </div>
    @endif

    <table class="table">
        <thead>
            <tr>
                <th width="6%">No</th>
                <th width="16%">Tanggal</th>
                <th width="26%">Nama Murid</th>
                <th width="24%">Guru Les</th>
                <th width="14%">Jenis Les</th>
                <th width="14%">Mata Pelajaran</th>
            </tr>
        </thead>
        <tbody>
            @forelse($attendances as $index => $item)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ \Carbon\Carbon::parse($item->date)->format('d/m/Y') }}</td>
                <td>{{ $item->student->name ?? '-' }}</td>
                <td>{{ $item->tutor->name ?? '-' }}</td>
                <td>{{ $item->lesCategory->code ?? $item->lesCategory->name ?? '-' }}</td>
                <td>{{ $item->subject }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="6" style="text-align: center; color: #000000;">Tidak ada data riwayat absensi.</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        Dicetak pada: {{ date('d/m/Y H:i') }} WIB
    </div>
</body>
</html>
