import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import StatCard from '../components/StatCard';
import { Users, UserCheck, CalendarCheck, Wallet, Clock, BookOpen, Sparkles, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await apiClient.get('/dashboard/summary');
      if (res.data?.success) {
        setSummary(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard summary:', err);
      setErrorMsg('Gagal terhubung ke server Laravel API backend. Pastikan "php artisan serve" aktif di port 8000.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p style={{ fontSize: '1rem', fontWeight: 600 }}>🔄 Memuat rangkuman data bimbel...</p>
      </div>
    );
  }

  const studentsByJenis = summary?.students_by_jenis_les || { reguler: 0, privat_in_house: 0, privat_in_bimbel: 0 };
  const breakdownDuration = summary?.students_by_jenis_les_and_duration || {};
  const totalActiveStudents = summary?.total_active_students || 0;

  const getPercentage = (count) => {
    if (!totalActiveStudents) return 0;
    return Math.round((count / totalActiveStudents) * 100);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Backend Connection Warning if error occurs */}
      {errorMsg && (
        <div style={{
          padding: '1rem 1.25rem',
          backgroundColor: 'rgba(244, 63, 94, 0.15)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          borderRadius: 'var(--radius-md)',
          color: '#fb7185',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <AlertCircle size={20} flexShrink={0} />
          <div style={{ flex: 1 }}>
            <strong>Peringatan Koneksi Backend:</strong> {errorMsg}
          </div>
          <button onClick={fetchSummary} className="btn btn-secondary btn-sm">Coba Lagi</button>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="glass-card" style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.75rem 2rem'
      }}>
        <div>
          <span className="badge badge-indigo" style={{ marginBottom: '0.5rem' }}>
            <Sparkles size={13} /> SIKEL (Sistem Informasi Les & Bimbel)
          </span>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff' }}>
            Selamat Datang di Dashboard Bimbel
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Pantau rangkuman jumlah murid, absensi mengajar guru, dan keuangan les secara real-time.
          </p>
        </div>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid-4">
        <StatCard
          title="Total Murid Aktif"
          value={totalActiveStudents}
          icon={Users}
          color="indigo"
          subtext="Murid terdaftar di bimbel"
        />
        <StatCard
          title="Total Guru Les"
          value={summary?.total_tutors || 0}
          icon={UserCheck}
          color="purple"
          subtext="Pengajar aktif"
        />
        <StatCard
          title="Presensi Bulan Ini"
          value={`${summary?.attendances_this_month || 0} Sesi`}
          icon={CalendarCheck}
          color="emerald"
          subtext="Total pertemuan mengajar"
        />
        <StatCard
          title="Pemasukan Bulan Ini"
          value={`Rp ${(summary?.income_this_month || 0).toLocaleString('id-ID')}`}
          icon={Wallet}
          color="amber"
          subtext="Rangkuman keuangan les"
        />
      </div>

      {/* Rangkuman Murid Les per Jenis Les & Durasi */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
              📚 Rangkuman Murid Les per Jenis Les
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Pembagian murid berdasarkan paket Reguler, Privat In House, dan Privat In Bimbel
            </p>
          </div>
        </div>

        <div className="grid-3">
          {/* Card 1: Reguler */}
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ padding: '0.5rem', borderRadius: '10px', backgroundColor: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.4)' }}>
                  <BookOpen size={20} color="#818cf8" />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>Les Reguler</h4>
                  <span className="badge badge-indigo">Durasi: 90 Menit</span>
                </div>
              </div>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#818cf8' }}>
                {studentsByJenis.reguler || 0} Murid
              </span>
            </div>

            <div style={{ marginTop: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                <span>Persentase Total</span>
                <span>{getPercentage(studentsByJenis.reguler)}%</span>
              </div>
              <div style={{ height: '8px', borderRadius: '4px', backgroundColor: 'var(--bg-input)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${getPercentage(studentsByJenis.reguler)}%`, backgroundColor: '#6366f1', borderRadius: '4px' }} />
              </div>
            </div>

            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>⏱️ Durasi 90 Menit:</span>
                <strong style={{ color: '#ffffff' }}>{breakdownDuration.reguler_90 ?? studentsByJenis.reguler ?? 0} Murid</strong>
              </div>
            </div>
          </div>

          {/* Card 2: Privat In House */}
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ padding: '0.5rem', borderRadius: '10px', backgroundColor: 'rgba(139, 92, 246, 0.2)', border: '1px solid rgba(139, 92, 246, 0.4)' }}>
                  <Clock size={20} color="#c084fc" />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>Privat In House</h4>
                  <span className="badge badge-purple">Tatap Muka di Rumah</span>
                </div>
              </div>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#c084fc' }}>
                {studentsByJenis.privat_in_house || 0} Murid
              </span>
            </div>

            <div style={{ marginTop: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                <span>Persentase Total</span>
                <span>{getPercentage(studentsByJenis.privat_in_house)}%</span>
              </div>
              <div style={{ height: '8px', borderRadius: '4px', backgroundColor: 'var(--bg-input)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${getPercentage(studentsByJenis.privat_in_house)}%`, backgroundColor: '#8b5cf6', borderRadius: '4px' }} />
              </div>
            </div>

            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>⏱️ Durasi 60 Menit:</span>
                <strong style={{ color: '#ffffff' }}>{breakdownDuration.privat_in_house_60 ?? 0} Murid</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>⏱️ Durasi 90 Menit:</span>
                <strong style={{ color: '#ffffff' }}>{breakdownDuration.privat_in_house_90 ?? 0} Murid</strong>
              </div>
            </div>
          </div>

          {/* Card 3: Privat In Bimbel */}
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ padding: '0.5rem', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
                  <Clock size={20} color="#34d399" />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>Privat In Bimbel</h4>
                  <span className="badge badge-emerald">Tatap Muka di Bimbel</span>
                </div>
              </div>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399' }}>
                {studentsByJenis.privat_in_bimbel || 0} Murid
              </span>
            </div>

            <div style={{ marginTop: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                <span>Persentase Total</span>
                <span>{getPercentage(studentsByJenis.privat_in_bimbel)}%</span>
              </div>
              <div style={{ height: '8px', borderRadius: '4px', backgroundColor: 'var(--bg-input)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${getPercentage(studentsByJenis.privat_in_bimbel)}%`, backgroundColor: '#10b981', borderRadius: '4px' }} />
              </div>
            </div>

            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>⏱️ Durasi 60 Menit:</span>
                <strong style={{ color: '#ffffff' }}>{breakdownDuration.privat_in_bimbel_60 ?? 0} Murid</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>⏱️ Durasi 90 Menit:</span>
                <strong style={{ color: '#ffffff' }}>{breakdownDuration.privat_in_bimbel_90 ?? 0} Murid</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
