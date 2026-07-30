import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Users, Calendar, Sparkles } from 'lucide-react';

const Navbar = ({ title, subtitle }) => {
  const { user, isAdmin } = useAuth();
  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <header style={{
      padding: '1.25rem 2rem',
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 10
    }}>
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Date Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.45rem 0.85rem',
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border-color)',
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}>
          <Calendar size={14} color="#6366f1" />
          <span>{currentDate}</span>
        </div>

        {/* User Level Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.45rem 0.85rem',
          backgroundColor: isAdmin ? 'rgba(99, 102, 241, 0.15)' : 'rgba(139, 92, 246, 0.15)',
          borderRadius: 'var(--radius-full)',
          border: isAdmin ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(139, 92, 246, 0.3)',
          fontSize: '0.8rem',
          fontWeight: 700,
          color: isAdmin ? '#818cf8' : '#c084fc'
        }}>
          {isAdmin ? <ShieldAlert size={14} /> : <Users size={14} />}
          <span>Level: {isAdmin ? 'Administrator' : 'Guru Les'}</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
