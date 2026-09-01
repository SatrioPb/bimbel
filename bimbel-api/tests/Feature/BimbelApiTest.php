<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Student;
use App\Models\Tutor;
use App\Models\LesCategory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BimbelApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_admin_can_login()
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@bimbel.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.role', 'admin');
    }

    public function test_guru_can_login()
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'guru@bimbel.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.role', 'guru');
    }

    public function test_dashboard_summary_returns_category_breakdown()
    {
        $user = User::where('email', 'admin@bimbel.com')->first();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/dashboard/summary');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    'students_by_jenis_les',
                    'total_active_students',
                    'total_tutors',
                    'attendances_this_month',
                    'income_this_month',
                ]
            ]);
    }

    public function test_admin_can_access_database_menu()
    {
        $admin = User::where('email', 'admin@bimbel.com')->first();

        $response = $this->actingAs($admin, 'sanctum')
            ->getJson('/api/v1/database/students');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);
    }

    public function test_guru_cannot_access_database_menu()
    {
        $guru = User::where('email', 'guru@bimbel.com')->first();

        $response = $this->actingAs($guru, 'sanctum')
            ->getJson('/api/v1/database/students');

        $response->assertStatus(403);
    }

    public function test_guru_can_log_attendance()
    {
        $guru = User::where('email', 'guru@bimbel.com')->first();
        $student = Student::first();
        $tutor = Tutor::first();
        $category = LesCategory::first();

        $response = $this->actingAs($guru, 'sanctum')
            ->postJson('/api/v1/attendances', [
                'tutor_id' => $tutor->id,
                'student_id' => $student->id,
                'les_category_id' => $category->id,
                'date' => date('Y-m-d'),
                'duration_minutes' => 90,
                'subject' => 'Matematika',
                'notes' => 'Catatan tes',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true);
    }

    public function test_pdf_student_history_export()
    {
        $admin = User::where('email', 'admin@bimbel.com')->first();

        $response = $this->actingAs($admin, 'sanctum')
            ->get('/api/v1/reports/history/students/pdf');

        $response->assertStatus(200)
            ->assertHeader('content-type', 'application/pdf');
    }

    public function test_excel_student_history_export()
    {
        $admin = User::where('email', 'admin@bimbel.com')->first();

        $response = $this->actingAs($admin, 'sanctum')
            ->get('/api/v1/reports/history/students/excel');

        $response->assertStatus(200);
    }

    public function test_pdf_invoice_export()
    {
        $admin = User::where('email', 'admin@bimbel.com')->first();
        $invoice = \App\Models\Invoice::first();

        $response = $this->actingAs($admin, 'sanctum')
            ->get("/api/v1/finance/invoices/{$invoice->id}/pdf");

        $response->assertStatus(200)
            ->assertHeader('content-type', 'application/pdf');
    }

    public function test_pdf_individual_tutor_salary_export()
    {
        $admin = User::where('email', 'admin@bimbel.com')->first();
        $tutor = \App\Models\Tutor::first();

        $response = $this->actingAs($admin, 'sanctum')
            ->get("/api/v1/finance/tutor-salaries/{$tutor->id}/pdf");

        $response->assertStatus(200)
            ->assertHeader('content-type', 'application/pdf');
    }
}
