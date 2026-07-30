import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  ClipboardCheck, 
  History, 
  Wallet, 
  Database, 
  GraduationCap, 
  LogOut, 
  UserCheck 
} from 'lucide-react';

const Sidebar = () => {
  const { user, isAdmin, logout } = useAuth();

  const navItems = [
    {
      name: 'Homepage',
      path: '/',
      icon: LayoutDashboard,
      roles: ['admin', 'guru'],
    },
    {
      name: 'Menu Absensi',
      path: '/absensi',
      icon: ClipboardCheck,
      roles: ['admin', 'guru'],
    },
    {
      name: 'Menu Riwayat',
      path: '/riwayat',
      icon: History,
      roles: ['admin', 'guru'],
    },
    {
      name: 'Menu Keuangan',
      path: '/keuangan',
      icon: Wallet,
      roles: ['admin'], // Admin only
    },
    {
      name: 'Menu Database',
      path: '/database',
      icon: Database,
      roles: ['admin'], // Admin only
    },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(user?.role));

  return (
    <aside style={{
      width: '260px',
      backgroundColor: '#090d16',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      padding: '1.5rem 1rem',
      flexShrink: 0,
      minHeight: '100vh',
    }}>
      {/* Brand Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0 0.5rem 1.5rem 0.5rem',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
        }}>
          <GraduationCap size={24} color="#ffffff" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#ffffff', lineHeight: 1.2 }}>
            BIMBEL <span style={{ color: '#818cf8' }}>LES</span>
          </h1>
          <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
            System Management
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
        <p style={{
          fontSize: '0.7rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--text-dim)',
          padding: '0.5rem 0.75rem'
        }}>
          NAVIGASI UTAMA
        </p>

        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.75rem 0.9rem',
                borderRadius: '10px',
                color: isActive ? '#ffffff' : 'var(--text-muted)',
                backgroundColor: isActive ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                border: isActive ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.9rem',
                textDecoration: 'none',
                transition: 'var(--transition)'
              })}
            >
              <Icon size={19} color={user?.role === 'admin' ? '#818cf8' : '#a78bfa'} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      <div style={{
        marginTop: 'auto',
        paddingTop: '1rem',
        borderTop: '1px solid var(--border-color)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.75rem',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          marginBottom: '0.75rem'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: isAdmin ? 'rgba(99, 102, 241, 0.25)' : 'rgba(139, 92, 246, 0.25)',
            border: isAdmin ? '1px solid #6366f1' : '1px solid #8b5cf6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            color: '#ffffff'
          }}>
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '0.85rem', fontWeight: '700', color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name || 'User'}
            </p>
            <span className={`badge ${isAdmin ? 'badge-indigo' : 'badge-purple'}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.45rem' }}>
              {isAdmin ? '🛡️ Admin' : '👨‍🏫 Guru Les'}
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          className="btn btn-secondary"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          <LogOut size={16} />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
