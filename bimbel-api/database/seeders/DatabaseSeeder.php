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
            'name' => 'Admin Bimbel',
            'email' => 'admin@bimbel.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'phone' => '081234567890',
            'status' => 'active',
        ]);

        // 2. Shared Guru User Account (Satu akun guru untuk semua guru)
        $sharedGuru = User::create([
            'name' => 'Guru Bimbel',
            'email' => 'guru@bimbel.com',
            'password' => Hash::make('password123'),
            'role' => 'guru',
            'phone' => '081299990000',
            'status' => 'active',
        ]);

        // Demo email for compatibility
        User::create([
            'name' => 'Guru Bimbel (Demo)',
            'email' => 'budi@bimbel.com',
            'password' => Hash::make('password123'),
            'role' => 'guru',
            'phone' => '081299990001',
            'status' => 'active',
        ]);

        // 3. Kategori Tipe Les (Les Categories with Fixed Pricing)
        // Reguler: 15.000
        $catReg = LesCategory::create([
            'code' => 'REG',
            'name' => 'Les Reguler',
            'default_duration' => 90,
            'fee_per_session' => 15000,
        ]);

        // Privat In House: 90m = 30.000, 60m = 25.000
        $catPih = LesCategory::create([
            'code' => 'PIH',
            'name' => 'Privat In House',
            'default_duration' => 90,
            'fee_per_session' => 30000,
        ]);

        // Privat In Bimbel: 90m = 25.000, 60m = 20.000
        $catPib = LesCategory::create([
            'code' => 'PIB',
            'name' => 'Privat In Bimbel',
            'default_duration' => 60,
            'fee_per_session' => 20000,
        ]);

        // 4. Data Guru Les (Fixed Honor: 15.000 per pertemuan per anak)
        $tutor1 = Tutor::create([
            'nip_code' => 'G2026001',
            'name' => 'Budi Santoso, S.Pd',
            'phone' => '081299990001',
            'specialization' => 'Matematika & IPA',
            'rate_per_session' => 15000,
        ]);

        $tutor2 = Tutor::create([
            'nip_code' => 'G2026002',
            'name' => 'Siti Aminah, M.Pd',
            'phone' => '081299990002',
            'specialization' => 'Bahasa Inggris',
            'rate_per_session' => 15000,
        ]);

        // 5. Data Murid Les (Students)
        $s1 = Student::create([
            'student_code' => 'M2026001',
            'name' => 'Andi Wijaya',
            'parent_name' => 'Bambang Wijaya',
            'parent_phone' => '08111111111',
            'address' => 'Jl. Mawar No. 12, Jakarta',
        ]);

        $s2 = Student::create([
            'student_code' => 'M2026002',
            'name' => 'Citra Dewi',
            'parent_name' => 'Hendra Dewi',
            'parent_phone' => '08122222222',
            'address' => 'Jl. Melati No. 45, Jakarta',
        ]);

        $s3 = Student::create([
            'student_code' => 'M2026003',
            'name' => 'Doni Pratama',
            'parent_name' => 'Eko Pratama',
            'parent_phone' => '08133333333',
            'address' => 'Jl. Anggrek No. 8, Jakarta',
        ]);

        $s4 = Student::create([
            'student_code' => 'M2026004',
            'name' => 'Elisa Fitri',
            'parent_name' => 'Gunawan Fitri',
            'parent_phone' => '08144444444',
            'address' => 'Jl. Flamboyan No. 20, Jakarta',
        ]);

        // 6. Sample Attendances
        Attendance::create([
            'tutor_id' => $tutor1->id,
            'student_id' => $s1->id,
            'les_category_id' => $catReg->id,
            'date' => date('Y-m-d', strtotime('-5 days')),
            'start_time' => '15:00',
            'end_time' => '16:30',
            'duration_minutes' => 90,
            'subject' => 'Matematika',
            'fee_per_session' => 15000,
            'notes' => 'Murid paham materi dengan baik.',
        ]);

        Attendance::create([
            'tutor_id' => $tutor1->id,
            'student_id' => $s3->id,
            'les_category_id' => $catPih->id,
            'date' => date('Y-m-d', strtotime('-3 days')),
            'start_time' => '16:00',
            'end_time' => '17:30',
            'duration_minutes' => 90,
            'subject' => 'Fisika',
            'fee_per_session' => 30000, // PIH 90m = 30.000
            'notes' => 'Tatap muka di rumah murid.',
        ]);

        Attendance::create([
            'tutor_id' => $tutor2->id,
            'student_id' => $s2->id,
            'les_category_id' => $catPib->id,
            'date' => date('Y-m-d', strtotime('-2 days')),
            'start_time' => '14:00',
            'end_time' => '15:00',
            'duration_minutes' => 60,
            'subject' => 'Bahasa Inggris',
            'fee_per_session' => 20000, // PIB 60m = 20.000
            'notes' => 'Latihan percakapan lancar.',
        ]);

        // 7. Sample Invoices
        $currentYear = (int)date('Y');
        $currentMonth = (int)date('m');

        Invoice::create([
            'invoice_number' => 'INV/' . $currentYear . '/' . sprintf('%02d', $currentMonth) . '/001',
            'student_id' => $s1->id,
            'month' => $currentMonth,
            'year' => $currentYear,
            'total_sessions' => 4,
            'fee_per_session' => 15000,
            'total_amount' => 60000,
            'discount' => 0,
            'final_amount' => 60000,
            'status' => 'paid',
            'paid_at' => now(),
            'notes' => 'Lunas via Transfer Bank',
        ]);
    }
}
