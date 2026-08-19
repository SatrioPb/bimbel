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
      setErrorMsg('Gagal terhubung ke server Laravel API backend. Pastikan "php artisan serve" aktif.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem 2rem', textAlign: 'center', color: '#64748b' }}>
        <p style={{ fontSize: '1rem', fontWeight: 600 }}>🔄 Memuat rangkuman data bimbel...</p>
      </div>
    );
  }

  const studentsByJenis = summary?.students_by_jenis_les || {};
  const totalActiveStudents = summary?.total_active_students || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Backend Connection Warning if error occurs */}
      {errorMsg && (
        <div style={{
          padding: '1rem 1.25rem',
          backgroundColor: '#fff1f2',
          border: '1px solid #fecdd3',
          borderRadius: 'var(--radius-md)',
          color: '#be123c',
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
        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        border: '1px solid #bfdbfe',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.75rem 2rem'
      }}>
        <div>
          <span className="badge badge-indigo" style={{ marginBottom: '0.5rem' }}>
            <Sparkles size={13} /> BIMBEL BINTANG (Sistem Informasi Bimbingan Belajar)
          </span>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1e40af' }}>
            Selamat Datang di Dashboard Bimbel
          </h2>
          <p style={{ color: '#334155', fontSize: '0.9rem', marginTop: '0.25rem', fontWeight: 500 }}>
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
          value={`Rp ${Number(summary?.income_this_month || 0).toLocaleString('id-ID')}`}
          icon={Wallet}
          color="amber"
          subtext="Rangkuman keuangan les"
        />
      </div>

      {/* Rangkuman Sesi Les per Kategori Tipe Les */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
              📚 Rangkuman Sesi Les per Kategori
            </h3>
            <p style={{ fontSize: '0.825rem', color: '#64748b' }}>
              Pembagian aktivitas bimbingan belajar berdasarkan Kategori Les (REG, PIH, PIB)
            </p>
          </div>
        </div>

        <div className="grid-3">
          {summary?.categories_breakdown && summary.categories_breakdown.length > 0 ? (
            summary.categories_breakdown.map((cat) => {
              const isPIH = cat.code.startsWith('PIH');
              const isPIB = cat.code.startsWith('PIB');
              const isREG = cat.code === 'REG';

              const badgeClass = isPIH ? 'badge-purple' : isPIB ? 'badge-emerald' : 'badge-indigo';
              const iconColor = isPIH ? '#7c3aed' : isPIB ? '#059669' : '#2563eb';
              const bgBox = isPIH ? '#f5f3ff' : isPIB ? '#ecfdf5' : '#eff6ff';
              const borderBox = isPIH ? '#ddd6fe' : isPIB ? '#a7f3d0' : '#bfdbfe';

              return (
                <div key={cat.id || cat.code} className="glass-card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div style={{ padding: '0.5rem', borderRadius: '10px', backgroundColor: bgBox, border: `1px solid ${borderBox}` }}>
                        {isREG ? <BookOpen size={20} color={iconColor} /> : <Clock size={20} color={iconColor} />}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>{cat.name}</h4>
                        <span className={`badge ${badgeClass}`}>
                          Kode: {cat.code} ({cat.duration_minutes} mnt)
                        </span>
                      </div>
                    </div>
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, color: iconColor }}>
                      {cat.count || 0} Sesi
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <>
              {/* Card 1: Reguler (REG) */}
              <div className="glass-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{ padding: '0.5rem', borderRadius: '10px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
                      <BookOpen size={20} color="#2563eb" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Les Reguler</h4>
                      <span className="badge badge-indigo">Kode: REG (90 mnt)</span>
                    </div>
                  </div>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2563eb' }}>
                    {studentsByJenis.REG || 0} Sesi
                  </span>
                </div>
              </div>

              {/* Card 2: Privat In House (PIH) */}
              <div className="glass-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{ padding: '0.5rem', borderRadius: '10px', backgroundColor: '#f5f3ff', border: '1px solid #ddd6fe' }}>
                      <Clock size={20} color="#7c3aed" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Privat In House</h4>
                      <span className="badge badge-purple">Kode: PIH (90 mnt)</span>
                    </div>
                  </div>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#7c3aed' }}>
                    {studentsByJenis.PIH || 0} Sesi
                  </span>
                </div>
              </div>

              {/* Card 3: Privat In Bimbel (PIB) */}
              <div className="glass-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{ padding: '0.5rem', borderRadius: '10px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0' }}>
                      <Clock size={20} color="#059669" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Privat In Bimbel</h4>
                      <span className="badge badge-emerald">Kode: PIB (60 mnt)</span>
                    </div>
                  </div>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#059669' }}>
                    {studentsByJenis.PIB || 0} Sesi
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
