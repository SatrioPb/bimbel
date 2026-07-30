<?php

namespace Database\Seeders;

use App\Models\Attendance;
use App\Models\Invoice;
use App\Models\Student;
use App\Models\Tutor;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Admin User
        $admin = User::create([
            'name' => 'Admin Bimbel',
            'email' => 'admin@bimbel.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'phone' => '081234567890',
            'status' => 'active',
        ]);

        // 2. Guru Users & Profiles
        $guru1 = User::create([
            'name' => 'Budi Santoso, S.Pd',
            'email' => 'budi@bimbel.com',
            'password' => Hash::make('password123'),
            'role' => 'guru',
            'phone' => '081299990001',
            'status' => 'active',
        ]);
        Tutor::create([
            'user_id' => $guru1->id,
            'nip_code' => 'G2026001',
            'specialization' => 'Matematika & IPA',
            'rate_per_session' => 100000,
        ]);

        $guru2 = User::create([
            'name' => 'Siti Aminah, M.Pd',
            'email' => 'siti@bimbel.com',
            'password' => Hash::make('password123'),
            'role' => 'guru',
            'phone' => '081299990002',
            'status' => 'active',
        ]);
        Tutor::create([
            'user_id' => $guru2->id,
            'nip_code' => 'G2026002',
            'specialization' => 'Bahasa Inggris',
            'rate_per_session' => 120000,
        ]);

        // 3. Murid Les (Students)
        $s1 = Student::create([
            'student_code' => 'M2026001',
            'name' => 'Andi Wijaya',
            'parent_name' => 'Bambang Wijaya',
            'parent_phone' => '08111111111',
            'address' => 'Jl. Mawar No. 12, Jakarta',
            'jenis_les' => 'reguler',
            'duration_minutes' => 90,
            'fee_per_session' => 75000,
            'status' => 'active',
        ]);

        $s2 = Student::create([
            'student_code' => 'M2026002',
            'name' => 'Citra Dewi',
            'parent_name' => 'Hendra Dewi',
            'parent_phone' => '08122222222',
            'address' => 'Jl. Melati No. 45, Jakarta',
            'jenis_les' => 'reguler',
            'duration_minutes' => 90,
            'fee_per_session' => 75000,
            'status' => 'active',
        ]);

        $s3 = Student::create([
            'student_code' => 'M2026003',
            'name' => 'Doni Pratama',
            'parent_name' => 'Eko Pratama',
            'parent_phone' => '08133333333',
            'address' => 'Jl. Anggrek No. 8, Jakarta',
            'jenis_les' => 'privat_in_house',
            'duration_minutes' => 60,
            'fee_per_session' => 100000,
            'status' => 'active',
        ]);

        $s4 = Student::create([
            'student_code' => 'M2026004',
            'name' => 'Elisa Fitri',
            'parent_name' => 'Gunawan Fitri',
            'parent_phone' => '08144444444',
            'address' => 'Jl. Flamboyan No. 20, Jakarta',
            'jenis_les' => 'privat_in_house',
            'duration_minutes' => 90,
            'fee_per_session' => 150000,
            'status' => 'active',
        ]);

        $s5 = Student::create([
            'student_code' => 'M2026005',
            'name' => 'Farhan Rizky',
            'parent_name' => 'Iwan Rizky',
            'parent_phone' => '08155555555',
            'address' => 'Jl. Kamboja No. 15, Jakarta',
            'jenis_les' => 'privat_in_bimbel',
            'duration_minutes' => 60,
            'fee_per_session' => 90000,
            'status' => 'active',
        ]);

        $s6 = Student::create([
            'student_code' => 'M2026006',
            'name' => 'Gita Permata',
            'parent_name' => 'Joko Permata',
            'parent_phone' => '08166666666',
            'address' => 'Jl. Kenanga No. 3, Jakarta',
            'jenis_les' => 'privat_in_bimbel',
            'duration_minutes' => 90,
            'fee_per_session' => 130000,
            'status' => 'active',
        ]);

        // 4. Sample Attendances
        $currentYear = (int)date('Y');
        $currentMonth = (int)date('m');

        Attendance::create([
            'tutor_id' => $guru1->id,
            'student_id' => $s1->id,
            'date' => date('Y-m-d', strtotime('-5 days')),
            'start_time' => '15:00',
            'end_time' => '16:30',
            'duration_minutes' => 90,
            'subject' => 'Matematika',
            'topic' => 'Aljabar dan Persamaan Kuadrat',
            'status' => 'hadir',
            'notes' => 'Murid paham materi dengan baik.',
        ]);

        Attendance::create([
            'tutor_id' => $guru1->id,
            'student_id' => $s3->id,
            'date' => date('Y-m-d', strtotime('-3 days')),
            'start_time' => '16:00',
            'end_time' => '17:00',
            'duration_minutes' => 60,
            'subject' => 'Fisika',
            'topic' => 'Hukum Newton & Gerak Lurus',
            'status' => 'hadir',
            'notes' => 'Tatap muka di rumah murid.',
        ]);

        Attendance::create([
            'tutor_id' => $guru2->id,
            'student_id' => $s2->id,
            'date' => date('Y-m-d', strtotime('-2 days')),
            'start_time' => '14:00',
            'end_time' => '15:30',
            'duration_minutes' => 90,
            'subject' => 'Bahasa Inggris',
            'topic' => 'Grammar & Reading Comprehension',
            'status' => 'hadir',
            'notes' => 'Latihan percakapan lancar.',
        ]);

        Attendance::create([
            'tutor_id' => $guru2->id,
            'student_id' => $s4->id,
            'date' => date('Y-m-d', strtotime('-1 days')),
            'start_time' => '18:30',
            'end_time' => '20:00',
            'duration_minutes' => 90,
            'subject' => 'Bahasa Inggris',
            'topic' => 'Tenses & Writing Essay',
            'status' => 'hadir',
            'notes' => 'Selesai tepat waktu.',
        ]);

        // 5. Sample Invoices
        Invoice::create([
            'invoice_number' => 'INV/' . $currentYear . '/' . sprintf('%02d', $currentMonth) . '/001',
            'student_id' => $s1->id,
            'month' => $currentMonth,
            'year' => $currentYear,
            'total_sessions' => 4,
            'fee_per_session' => 75000,
            'total_amount' => 300000,
            'discount' => 0,
            'final_amount' => 300000,
            'status' => 'paid',
            'paid_at' => now(),
            'notes' => 'Lunas via Transfer Bank',
        ]);

        Invoice::create([
            'invoice_number' => 'INV/' . $currentYear . '/' . sprintf('%02d', $currentMonth) . '/002',
            'student_id' => $s3->id,
            'month' => $currentMonth,
            'year' => $currentYear,
            'total_sessions' => 4,
            'fee_per_session' => 100000,
            'total_amount' => 400000,
            'discount' => 20000,
            'final_amount' => 380000,
            'status' => 'unpaid',
            'notes' => 'Menunggu konfirmasi pembayaran',
        ]);
    }
}
