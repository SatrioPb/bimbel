import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserCheck, Bell, ChevronRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Navbar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/': return 'Dashboard Summary';
      case '/absensi': return 'Menu Absensi Mengajar';
      case '/riwayat': return 'Menu Riwayat Absensi';
      case '/keuangan': return 'Menu Keuangan & Invoice';
      case '/database': return 'Menu Database Les';
      default: return 'Bimbel System';
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <header style={{
      height: '64px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 20
    }}>
      {/* Page Title & Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
        <span style={{ color: '#64748b', fontWeight: 500 }}>SIKEL</span>
        <ChevronRight size={14} color="#94a3b8" />
        <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
          {getPageTitle(location.pathname)}
        </h2>
      </div>

      {/* Right User Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span className={`badge ${isAdmin ? 'badge-indigo' : 'badge-emerald'}`}>
          {isAdmin ? <ShieldCheck size={13} /> : <UserCheck size={13} />}
          <span>{isAdmin ? 'Admin Mode' : 'Guru Mode'}</span>
        </span>

        <div style={{
          height: '24px',
          width: '1px',
          backgroundColor: '#e2e8f0'
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.825rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
              {user?.name || 'User'}
            </p>
            <p style={{ fontSize: '0.725rem', color: '#64748b' }}>
              {user?.email || 'user@bimbel.com'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
