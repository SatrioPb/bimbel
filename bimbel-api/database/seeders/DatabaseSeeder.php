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

        // 2. Shared Guru User Account
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

        // 3. Kategori Tipe Les (5 Explicit Categories with Fixed Pricing & Durations)
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
            'les_category_id' => $catPih90->id,
            'date' => date('Y-m-d', strtotime('-3 days')),
            'start_time' => '16:00',
            'end_time' => '17:30',
            'duration_minutes' => 90,
            'subject' => 'Fisika',
            'fee_per_session' => 30000,
            'notes' => 'Tatap muka di rumah murid.',
        ]);

        Attendance::create([
            'tutor_id' => $tutor2->id,
            'student_id' => $s2->id,
            'les_category_id' => $catPib60->id,
            'date' => date('Y-m-d', strtotime('-2 days')),
            'start_time' => '14:00',
            'end_time' => '15:00',
            'duration_minutes' => 60,
            'subject' => 'Bahasa Inggris',
            'fee_per_session' => 20000,
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
