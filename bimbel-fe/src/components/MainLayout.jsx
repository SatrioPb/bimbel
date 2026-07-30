import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const MainLayout = () => {
  const location = useLocation();

  const getPageMeta = () => {
    switch (location.pathname) {
      case '/':
        return {
          title: 'Dashboard Rangkuman Les',
          subtitle: 'Rangkuman jumlah murid les berdasarkan jenis les & statistik harian'
        };
      case '/absensi':
        return {
          title: 'Menu Absensi Mengajar',
          subtitle: 'Input dan pencatatan presensi kehadiran mengajar guru les'
        };
      case '/riwayat':
        return {
          title: 'Menu Riwayat Absensi',
          subtitle: 'Rekapitulasi riwayat presensi murid & jam mengajar guru dengan opsi PDF & Excel'
        };
      case '/keuangan':
        return {
          title: 'Menu Keuangan & Invoice',
          subtitle: 'Kelola invoice les wali murid dan rangkuman total pemasukan bimbel'
        };
      case '/database':
        return {
          title: 'Menu Database Les',
          subtitle: 'Kelola data murid les (Reguler, Privat) dan data profil guru pengajar'
        };
      default:
        return {
          title: 'Sistem Informasi Les & Bimbel',
          subtitle: 'Management Dashboard'
        };
    }
  };

  const { title, subtitle } = getPageMeta();

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar title={title} subtitle={subtitle} />
        <main className="page-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
