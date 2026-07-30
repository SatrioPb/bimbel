# Bimbel & Les Management System (SIKEL)

Sistem Informasi Manajemen Les & Bimbel terintegrasi dengan **Laravel REST API Backend** & **React Vite Frontend**.

---

## 📁 Struktur Project

- **`bimbel-api/`**: Backend REST API dengan Laravel 12 (Auth Sanctum, Role Management, Presensi, Finance, PDF & Excel Export).
- **`bimbel-fe/`**: Frontend SPA dengan React 18 + Vite (Design System Glassmorphism, Dual Role Access, Stat Dashboard).

---

## 🚀 Cara Menjalankan Project

### 1. Backend (Laravel API)
```bash
cd bimbel-api
composer install
php artisan migrate --seed
php artisan serve
```
> Backend berjalan di: `http://127.0.0.1:8000`

### 2. Frontend (React + Vite)
```bash
cd bimbel-fe
npm install
npm run dev
```
> Frontend berjalan di: `http://localhost:3000`

---

## 🔑 Akun Demo Pengetesan
- **Admin**: `admin@bimbel.com` / `password123`
- **Guru Les**: `budi@bimbel.com` / `password123`
