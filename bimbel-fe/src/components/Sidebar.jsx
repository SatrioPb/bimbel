import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, ClipboardCheck, History, Wallet, Database, LogOut, GraduationCap, ShieldAlert } from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/absensi', label: 'Menu Absensi', icon: ClipboardCheck },
    { path: '/riwayat', label: 'Menu Riwayat', icon: History },
  ];

  if (isAdmin) {
    navItems.push(
      { path: '/keuangan', label: 'Menu Keuangan', icon: Wallet },
      { path: '/database', label: 'Menu Database', icon: Database }
    );
  }

  return (
    <aside style={{
      width: '260px',
      backgroundColor: '#ffffff',
      borderRight: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
      zIndex: 30
    }}>
      {/* Brand Header */}
      <div style={{
        padding: '1.25rem 1.5rem',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          backgroundColor: '#2563eb',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
        }}>
          <GraduationCap size={22} />
        </div>
        <div>
          <h1 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            BIMBEL
          </h1>
          <p style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 500 }}>
            Panel Admin
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <div style={{ padding: '1.25rem 1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <p style={{
          fontSize: '0.7rem',
          fontWeight: 700,
          color: '#94a3b8',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          padding: '0 0.5rem 0.4rem 0.5rem'
        }}>
          Navigation
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#2563eb' : '#475569',
                backgroundColor: isActive ? '#eff6ff' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.15s ease'
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon size={19} color={isActive ? '#2563eb' : '#64748b'} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* User Info & Logout */}
      <div style={{
        padding: '1rem 1.25rem',
        borderTop: '1px solid #e2e8f0',
        backgroundColor: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', overflow: 'hidden' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '9999px',
            backgroundColor: isAdmin ? '#e0e7ff' : '#ecfdf5',
            color: isAdmin ? '#4338ca' : '#047857',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.85rem',
            flexShrink: 0
          }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontSize: '0.825rem', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name || 'User'}
            </p>

            <span className={`badge ${isAdmin ? 'badge-indigo' : 'badge-emerald'}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.45rem' }}>
              {isAdmin ? 'ADMINISTRATOR' : 'GURU LES'}
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          title="Logout"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '0.35rem',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.15s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#dc2626'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
