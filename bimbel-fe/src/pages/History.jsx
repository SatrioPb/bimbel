import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { History as HistoryIcon, FileText, FileSpreadsheet, Download, Search, Filter } from 'lucide-react';

const History = () => {
  const [activeTab, setActiveTab] = useState('students'); // 'students' or 'tutors'
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchHistory();
  }, [activeTab]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'students' ? '/reports/history/students' : '/reports/history/tutors';
      const res = await apiClient.get(endpoint);
      if (res.data.success) {
        setHistoryData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type, format) => {
    try {
      const url = `/api/v1/reports/history/${type}/${format}`;
      const token = localStorage.getItem('auth_token');

      // Fetch blob with auth header
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', `riwayat_${type}_${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Gagal mengeksport berkas: ' + err.message);
    }
  };

  const filteredData = historyData.filter(item => {
    const term = search.toLowerCase();
    const studentName = item.student?.name?.toLowerCase() || '';
    const tutorName = item.tutor?.name?.toLowerCase() || '';
    const subject = item.subject?.toLowerCase() || '';
    return studentName.includes(term) || tutorName.includes(term) || subject.includes(term);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header & Export Actions */}
      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
            📋 Riwayat Absensi Sesi Les
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Lihat rekapitulasi presensi murid dan jam mengajar guru les
          </p>
        </div>

        {/* Export Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => handleExport(activeTab, 'pdf')}
            className="btn btn-secondary"
            style={{ borderColor: 'rgba(244, 63, 94, 0.4)', color: '#fb7185' }}
          >
            <FileText size={18} color="#fb7185" />
            <span>Export PDF</span>
          </button>
          <button
            onClick={() => handleExport(activeTab, 'excel')}
            className="btn btn-emerald"
          >
            <FileSpreadsheet size={18} />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="glass-card">
        {/* Tabs */}
        <div className="tabs-container">
          <button
            className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            👨‍🎓 Riwayat Absensi Murid Les
          </button>
          <button
            className={`tab-btn ${activeTab === 'tutors' ? 'active' : ''}`}
            onClick={() => setActiveTab('tutors')}
          >
            👩‍🏫 Riwayat Absensi Guru Les
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: '1.25rem', maxWidth: '360px', position: 'relative' }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Cari murid, guru, atau mapel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Table Data */}
        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Memuat riwayat absensi...</p>
        ) : filteredData.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>Tidak ada data riwayat absensi ditemukan.</p>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  {activeTab === 'students' ? (
                    <>
                      <th>Murid Les</th>
                      <th>Guru Les</th>
                    </>
                  ) : (
                    <>
                      <th>Guru Les</th>
                      <th>Murid Les</th>
                    </>
                  )}
                  <th>Mata Pelajaran</th>
                  <th>Topik / Materi</th>
                  <th>Durasi</th>
                  <th>Status</th>
                  <th>Catatan</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr key={item.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{item.date}</td>
                    <td style={{ fontWeight: 700, color: '#818cf8' }}>
                      {activeTab === 'students' ? (item.student?.name || item.student_id) : (item.tutor?.name || item.tutor_id)}
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {activeTab === 'students' ? (item.tutor?.name || item.tutor_id) : (item.student?.name || item.student_id)}
                    </td>
                    <td style={{ fontWeight: 600 }}>{item.subject}</td>
                    <td>{item.topic || '-'}</td>
                    <td>{item.duration_minutes} Menit</td>
                    <td>
                      <span className={`badge ${
                        item.status === 'hadir' ? 'badge-emerald' :
                        item.status === 'izin' ? 'badge-amber' :
                        item.status === 'sakit' ? 'badge-indigo' : 'badge-rose'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>{item.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
