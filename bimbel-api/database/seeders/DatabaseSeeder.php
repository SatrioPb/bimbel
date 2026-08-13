<?php

namespace Database\Seeders;

use App\Models\Attendance;
use App\Models\Invoice;
use App\Models\LesCategory;
use App\Models\Student;
use App\Models\Tutor;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Admin User Account
        $admin = User::create([
            'name' => 'Admin Utama Bimbel',
            'email' => 'admin@bimbel.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'phone' => '081234567890',
            'status' => 'active',
        ]);

        // 2. Guru User Accounts
        $guru1 = User::create([
            'name' => 'Guru Bimbel (Umum)',
            'email' => 'guru@bimbel.com',
            'password' => Hash::make('password123'),
            'role' => 'guru',
            'phone' => '081299990000',
            'status' => 'active',
        ]);

        $guru2 = User::create([
            'name' => 'Budi Santoso, S.Pd',
            'email' => 'budi@bimbel.com',
            'password' => Hash::make('password123'),
            'role' => 'guru',
            'phone' => '081299990001',
            'status' => 'active',
        ]);

        $guru3 = User::create([
            'name' => 'Siti Aminah, M.Pd',
            'email' => 'siti@bimbel.com',
            'password' => Hash::make('password123'),
            'role' => 'guru',
            'phone' => '081299990002',
            'status' => 'active',
        ]);

        // 3. Kategori Tipe Les (5 Fixed Packages)
        $catPih90 = LesCategory::create([
            'code' => 'PIH90',
            'name' => 'Privat In House 90 Menit',
            'default_duration' => 90,
            'fee_per_session' => 30000,
        ]);

        $catPih60 = LesCategory::create([
            'code' => 'PIH60',
            'name' => 'Privat In House 60 Menit',
            'default_duration' => 60,
            'fee_per_session' => 25000,
        ]);

        $catPib90 = LesCategory::create([
            'code' => 'PIB90',
            'name' => 'Privat In Bimbel 90 Menit',
            'default_duration' => 90,
            'fee_per_session' => 25000,
        ]);

        $catPib60 = LesCategory::create([
            'code' => 'PIB60',
            'name' => 'Privat In Bimbel 60 Menit',
            'default_duration' => 60,
            'fee_per_session' => 20000,
        ]);

        $catReg = LesCategory::create([
            'code' => 'REG',
            'name' => 'Les Reguler',
            'default_duration' => 90,
            'fee_per_session' => 15000,
        ]);

        // 4. Data Guru Les (Tutors)
        $t1 = Tutor::create([
            'nip_code' => 'G2026001',
            'name' => 'Budi Santoso, S.Pd',
            'phone' => '081299990001',
            'specialization' => 'Matematika & Fisika (SMA)',
            'rate_per_session' => 15000,
        ]);

        $t2 = Tutor::create([
            'nip_code' => 'G2026002',
            'name' => 'Siti Aminah, M.Pd',
            'phone' => '081299990002',
            'specialization' => 'Bahasa Inggris & Bahasa Indonesia',
            'rate_per_session' => 15000,
        ]);

        $t3 = Tutor::create([
            'nip_code' => 'G2026003',
            'name' => 'Rizky Pratama, S.Si',
            'phone' => '081299990003',
            'specialization' => 'Kimia & Biologi (SMP/SMA)',
            'rate_per_session' => 15000,
        ]);

        $t4 = Tutor::create([
            'nip_code' => 'G2026004',
            'name' => 'Dewi Lestari, S.Pd',
            'phone' => '081299990004',
            'specialization' => 'Tematik SD & Matematika Dasar',
            'rate_per_session' => 15000,
        ]);

        // 5. Data Murid Les (Students)
        $s1 = Student::create([
            'student_code' => 'M2026001',
            'name' => 'Andi Wijaya',
            'parent_name' => 'Bambang Wijaya',
            'parent_phone' => '08111111111',
            'address' => 'Jl. Mawar No. 12, Kebayoran Baru, Jakarta Selatan',
        ]);

        $s2 = Student::create([
            'student_code' => 'M2026002',
            'name' => 'Citra Dewi',
            'parent_name' => 'Hendra Dewi',
            'parent_phone' => '08122222222',
            'address' => 'Jl. Melati No. 45, Tebet, Jakarta Selatan',
        ]);

        $s3 = Student::create([
            'student_code' => 'M2026003',
            'name' => 'Doni Pratama',
            'parent_name' => 'Eko Pratama',
            'parent_phone' => '08133333333',
            'address' => 'Jl. Anggrek No. 8, Setiabudi, Jakarta Selatan',
        ]);

        $s4 = Student::create([
            'student_code' => 'M2026004',
            'name' => 'Elisa Fitri',
            'parent_name' => 'Gunawan Fitri',
            'parent_phone' => '08144444444',
            'address' => 'Jl. Flamboyan No. 20, Cilandak, Jakarta Selatan',
        ]);

        $s5 = Student::create([
            'student_code' => 'M2026005',
            'name' => 'Farhan Kurniadi',
            'parent_name' => 'Agus Kurniadi',
            'parent_phone' => '08155555555',
            'address' => 'Jl. Dahlia No. 3, Pasar Minggu, Jakarta Selatan',
        ]);

        $s6 = Student::create([
            'student_code' => 'M2026006',
            'name' => 'Grace Nabila',
            'parent_name' => 'Rudy Nabila',
            'parent_phone' => '08166666666',
            'address' => 'Jl. Cempaka No. 88, Pancoran, Jakarta Selatan',
        ]);

        // 6. Sample Attendances (Aktivitas Presensi Les)
        $today = date('Y-m-d');
        
        Attendance::create([
            'tutor_id' => $t1->id,
            'student_id' => $s1->id,
            'les_category_id' => $catPih90->id,
            'date' => date('Y-m-d', strtotime('-1 days')),
            'start_time' => '15:00',
            'end_time' => '16:30',
            'duration_minutes' => 90,
            'subject' => 'Matematika SMA',
            'fee_per_session' => 30000,
            'notes' => 'Pembahasan latihan soal Persamaan Kuadrat & Fungsi Kuadrat.',
        ]);

        Attendance::create([
            'tutor_id' => $t1->id,
            'student_id' => $s1->id,
            'les_category_id' => $catPih90->id,
            'date' => date('Y-m-d', strtotime('-3 days')),
            'start_time' => '15:00',
            'end_time' => '16:30',
            'duration_minutes' => 90,
            'subject' => 'Matematika SMA',
            'fee_per_session' => 30000,
            'notes' => 'Murid paham rumus Trigonometri dasar dengan sangat baik.',
        ]);

        Attendance::create([
            'tutor_id' => $t2->id,
            'student_id' => $s2->id,
            'les_category_id' => $catPib60->id,
            'date' => date('Y-m-d', strtotime('-2 days')),
            'start_time' => '14:00',
            'end_time' => '15:00',
            'duration_minutes' => 60,
            'subject' => 'Bahasa Inggris',
            'fee_per_session' => 20000,
            'notes' => 'Latihan percakapan Grammar & Conversation kelas 8.',
        ]);

        Attendance::create([
            'tutor_id' => $t2->id,
            'student_id' => $s2->id,
            'les_category_id' => $catPib60->id,
            'date' => date('Y-m-d', strtotime('-4 days')),
            'start_time' => '14:00',
            'end_time' => '15:00',
            'duration_minutes' => 60,
            'subject' => 'Bahasa Inggris',
            'fee_per_session' => 20000,
            'notes' => 'Membahas Reading Comprehension & Vocabulary.',
        ]);

        Attendance::create([
            'tutor_id' => $t3->id,
            'student_id' => $s3->id,
            'les_category_id' => $catPib90->id,
            'date' => date('Y-m-d', strtotime('-2 days')),
            'start_time' => '16:00',
            'end_time' => '17:30',
            'duration_minutes' => 90,
            'subject' => 'Fisika SMA',
            'fee_per_session' => 25000,
            'notes' => 'Pendalaman konsep Hukum Newton II dan aplikasinya.',
        ]);

        Attendance::create([
            'tutor_id' => $t3->id,
            'student_id' => $s3->id,
            'les_category_id' => $catPib90->id,
            'date' => date('Y-m-d', strtotime('-5 days')),
            'start_time' => '16:00',
            'end_time' => '17:30',
            'duration_minutes' => 90,
            'subject' => 'Kimia SMA',
            'fee_per_session' => 25000,
            'notes' => 'Latihan perhitungan Stokiometri & Konsep Mol.',
        ]);

        Attendance::create([
            'tutor_id' => $t4->id,
            'student_id' => $s4->id,
            'les_category_id' => $catReg->id,
            'date' => date('Y-m-d', strtotime('-1 days')),
            'start_time' => '13:30',
            'end_time' => '15:00',
            'duration_minutes' => 90,
            'subject' => 'Tematik SD',
            'fee_per_session' => 15000,
            'notes' => 'Persiapan Ulangan Harian Tema 2 Organ Tubuh.',
        ]);

        Attendance::create([
            'tutor_id' => $t4->id,
            'student_id' => $s5->id,
            'les_category_id' => $catReg->id,
            'date' => date('Y-m-d', strtotime('-3 days')),
            'start_time' => '15:30',
            'end_time' => '17:00',
            'duration_minutes' => 90,
            'subject' => 'Matematika SD',
            'fee_per_session' => 15000,
            'notes' => 'Penjumlahan dan Pengurangan Pecahan.',
        ]);

        Attendance::create([
            'tutor_id' => $t1->id,
            'student_id' => $s6->id,
            'les_category_id' => $catPih60->id,
            'date' => date('Y-m-d', strtotime('-4 days')),
            'start_time' => '17:00',
            'end_time' => '18:00',
            'duration_minutes' => 60,
            'subject' => 'Matematika SMP',
            'fee_per_session' => 25000,
            'notes' => 'Les tatap muka di rumah murid. Materi Aljabar Dasar.',
        ]);

        // 7. Sample Invoices (Daftar Invoice Keuangan Bulan Ini & Bulan Lalu)
        $currentYear = (int)date('Y');
        $currentMonth = (int)date('m');

        $prevYear = $currentMonth === 1 ? $currentYear - 1 : $currentYear;
        $prevMonth = $currentMonth === 1 ? 12 : $currentMonth - 1;

        // Invoice 1: LUNAS (Bulan Ini)
        Invoice::create([
            'invoice_number' => 'INV/' . $currentYear . '/' . sprintf('%02d', $currentMonth) . '/001',
            'student_id' => $s1->id,
            'month' => $currentMonth,
            'year' => $currentYear,
            'total_sessions' => 2,
            'fee_per_session' => 30000,
            'total_amount' => 60000,
            'discount' => 0,
            'final_amount' => 60000,
            'status' => 'paid',
            'paid_at' => now(),
            'notes' => 'Lunas via Transfer BCA Wali Murid',
        ]);

        // Invoice 2: BELUM BAYAR (Bulan Ini)
        Invoice::create([
            'invoice_number' => 'INV/' . $currentYear . '/' . sprintf('%02d', $currentMonth) . '/002',
            'student_id' => $s2->id,
            'month' => $currentMonth,
            'year' => $currentYear,
            'total_sessions' => 2,
            'fee_per_session' => 20000,
            'total_amount' => 40000,
            'discount' => 0,
            'final_amount' => 40000,
            'status' => 'unpaid',
            'paid_at' => null,
            'notes' => 'Tagihan terbit 2 sesi les',
        ]);

        // Invoice 3: LUNAS (Bulan Ini)
        Invoice::create([
            'invoice_number' => 'INV/' . $currentYear . '/' . sprintf('%02d', $currentMonth) . '/003',
            'student_id' => $s3->id,
            'month' => $currentMonth,
            'year' => $currentYear,
            'total_sessions' => 2,
            'fee_per_session' => 25000,
            'total_amount' => 50000,
            'discount' => 0,
            'final_amount' => 50000,
            'status' => 'paid',
            'paid_at' => now(),
            'notes' => 'Lunas via Transfer Mandiri',
        ]);

        // Invoice 4: BELUM BAYAR (Bulan Ini)
        Invoice::create([
            'invoice_number' => 'INV/' . $currentYear . '/' . sprintf('%02d', $currentMonth) . '/004',
            'student_id' => $s4->id,
            'month' => $currentMonth,
            'year' => $currentYear,
            'total_sessions' => 1,
            'fee_per_session' => 15000,
            'total_amount' => 15000,
            'discount' => 0,
            'final_amount' => 15000,
            'status' => 'unpaid',
            'paid_at' => null,
            'notes' => 'Menunggu konfirmasi wali murid',
        ]);

        // Invoice 5: LUNAS (Bulan Lalu)
        Invoice::create([
            'invoice_number' => 'INV/' . $prevYear . '/' . sprintf('%02d', $prevMonth) . '/001',
            'student_id' => $s1->id,
            'month' => $prevMonth,
            'year' => $prevYear,
            'total_sessions' => 4,
            'fee_per_session' => 30000,
            'total_amount' => 120000,
            'discount' => 0,
            'final_amount' => 120000,
            'status' => 'paid',
            'paid_at' => date('Y-m-d H:i:s', strtotime('-25 days')),
            'notes' => 'Lunas bulan lalu',
        ]);
    }
}
