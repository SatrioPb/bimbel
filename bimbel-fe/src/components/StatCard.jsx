import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = 'indigo', subtext }) => {
  const colorMap = {
    indigo: { bg: 'rgba(99, 102, 241, 0.15)', text: '#818cf8', border: 'rgba(99, 102, 241, 0.3)' },
    emerald: { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.3)' },
    amber: { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' },
    purple: { bg: 'rgba(139, 92, 246, 0.15)', text: '#c084fc', border: 'rgba(139, 92, 246, 0.3)' },
    rose: { bg: 'rgba(244, 63, 94, 0.15)', text: '#fb7185', border: 'rgba(244, 63, 94, 0.3)' },
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
      <div style={{
        width: '54px',
        height: '54px',
        borderRadius: '16px',
        backgroundColor: scheme.bg,
        border: `1px solid ${scheme.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        {Icon && <Icon size={26} color={scheme.text} />}
      </div>
      <div>
        <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: 600 }}>{title}</p>
        <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.2, margin: '0.15rem 0' }}>
          {value}
        </h2>
        {subtext && <p style={{ fontSize: '0.725rem', color: 'var(--text-dim)' }}>{subtext}</p>}
      </div>
    </div>
  );
};

export default StatCard;
