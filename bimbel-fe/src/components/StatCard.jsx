import React from 'react';

const StatCard = ({ title, value, icon: Icon, subtext, color = 'indigo' }) => {
  const getColorStyles = () => {
    switch (color) {
      case 'emerald':
        return { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' };
      case 'amber':
        return { bg: '#fffbe6', text: '#b45309', border: '#fef08a' };
      case 'rose':
        return { bg: '#fff1f2', text: '#be123c', border: '#fecdd3' };
      case 'purple':
        return { bg: '#f5f3ff', text: '#6d28d9', border: '#ddd6fe' };
      case 'indigo':
      default:
        return { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' };
    }
  };

  const style = getColorStyles();

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
            {title}
          </p>
          <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            {value}
          </h3>
        </div>

        {Icon && (
          <div style={{
            padding: '0.65rem',
            borderRadius: '10px',
            backgroundColor: style.bg,
            color: style.text,
            border: `1px solid ${style.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Icon size={22} />
          </div>
        )}
      </div>

      {subtext && (
        <div style={{ marginTop: '0.85rem', paddingTop: '0.65rem', borderTop: '1px solid #f1f5f9', fontSize: '0.775rem', color: '#64748b' }}>
          {subtext}
        </div>
      )}
    </div>
  );
};

export default StatCard;
