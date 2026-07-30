<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\TutorController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\FinanceController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // Public Auth
    Route::post('/auth/login', [AuthController::class, 'login']);

    // Authenticated Routes (Admin & Guru)
    Route::middleware('auth:sanctum')->group(function () {

        // Auth management
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);

        // Homepage Dashboard Summary
        Route::get('/dashboard/summary', [DashboardController::class, 'summary']);

        // List Murid untuk Dropdown Presensi (Bisa diakses Admin & Guru)
        Route::get('/students/options', [StudentController::class, 'index']);

        // Menu Absensi
        Route::apiResource('/attendances', AttendanceController::class);

        // Menu Riwayat (Filter, Export PDF & Excel)
        Route::prefix('reports')->group(function () {
            // Riwayat Absensi Murid
            Route::get('/history/students', [ReportController::class, 'studentHistory']);
            Route::get('/history/students/pdf', [ReportController::class, 'studentHistoryPdf']);
            Route::get('/history/students/excel', [ReportController::class, 'studentHistoryExcel']);

            // Riwayat Absensi Guru
            Route::get('/history/tutors', [ReportController::class, 'tutorHistory']);
            Route::get('/history/tutors/pdf', [ReportController::class, 'tutorHistoryPdf']);
            Route::get('/history/tutors/excel', [ReportController::class, 'tutorHistoryExcel']);
        });

        // Admin Only Routes (Menu Database & Menu Keuangan)
        Route::middleware('role:admin')->group(function () {

            // Menu Database
            Route::prefix('database')->group(function () {
                Route::apiResource('/students', StudentController::class);
                Route::apiResource('/tutors', TutorController::class);
            });

            // Menu Keuangan
            Route::prefix('finance')->group(function () {
                Route::get('/invoices', [FinanceController::class, 'invoices']);
                Route::post('/invoices/generate', [FinanceController::class, 'generateInvoices']);
                Route::get('/invoices/excel', [FinanceController::class, 'invoicesExcel']);
                Route::get('/invoices/{id}', [FinanceController::class, 'show']);
                Route::put('/invoices/{id}/pay', [FinanceController::class, 'markPaid']);
                Route::get('/invoices/{id}/pdf', [FinanceController::class, 'invoicePdf']);

                Route::get('/income-summary', [FinanceController::class, 'incomeSummary']);
                Route::get('/income-summary/pdf', [FinanceController::class, 'incomeSummaryPdf']);
                Route::get('/income-summary/excel', [FinanceController::class, 'incomeSummaryExcel']);
            });

        });

    });

});
