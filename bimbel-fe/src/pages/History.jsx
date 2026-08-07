import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { History as HistoryIcon, FileText, FileSpreadsheet, Filter, Search, Calendar, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const History = () => {
  const { user } = useAuth();
  const [historyTab, setHistoryTab] = useState('tutors'); // 'tutors' or 'students'
  const [attendances, setAttendances] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedTutorId, setSelectedTutorId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [historyTab, selectedMonth, selectedYear, selectedTutorId, selectedStudentId]);

  const fetchFilterOptions = async () => {
    try {
      const [tRes, sRes] = await Promise.all([
        apiClient.get('/tutors/options').catch(() => ({ data: { data: [] } })),
        apiClient.get('/students/options').catch(() => ({ data: { data: [] } }))
      ]);
      if (tRes.data?.success) setTutors(tRes.data.data);
      if (sRes.data?.success) setStudents(sRes.data.data);
    } catch (err) {
      console.error('Error fetching filter options:', err);
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const endpoint = historyTab === 'tutors' ? '/reports/history/tutors' : '/reports/history/students';
      const params = {};
      if (selectedMonth) params.month = selectedMonth;
      if (selectedYear) params.year = selectedYear;
      if (historyTab === 'tutors' && selectedTutorId) params.tutor_id = selectedTutorId;
      if (historyTab === 'students' && selectedStudentId) params.student_id = selectedStudentId;

      const res = await apiClient.get(endpoint, { params });
      if (res.data?.success) {
        setAttendances(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const endpoint = historyTab === 'tutors' 
        ? `/reports/history/tutors/${format}` 
        : `/reports/history/students/${format}`;

      const params = new URLSearchParams();
      if (selectedMonth) params.append('month', selectedMonth);
      if (selectedYear) params.append('year', selectedYear);
      if (historyTab === 'tutors' && selectedTutorId) params.append('tutor_id', selectedTutorId);
      if (historyTab === 'students' && selectedStudentId) params.append('student_id', selectedStudentId);

      const response = await apiClient.get(`${endpoint}?${params.toString()}`, {
        responseType: 'blob'
      });

      const mimeType = format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: mimeType }));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', `riwayat_${historyTab}_${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert(`Gagal mengeksport berkas ${format}.`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Banner & Export Actions */}
      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge badge-indigo" style={{ marginBottom: '0.4rem' }}>📊 Export & Report</span>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
            Menu Riwayat Absensi Les
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Pantau riwayat jam mengajar guru les dan kehadiran murid les dengan filter bulan
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={() => handleExport('pdf')} className="btn btn-secondary" style={{ borderColor: 'rgba(244, 63, 94, 0.4)', color: '#fb7185' }}>
            <FileText size={18} />
            <span>Export PDF</span>
          </button>
          <button onClick={() => handleExport('excel')} className="btn btn-emerald">
            <FileSpreadsheet size={18} />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="glass-card">
        {/* Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div className="tabs-container" style={{ margin: 0 }}>
            <button
              className={`tab-btn ${historyTab === 'tutors' ? 'active' : ''}`}
              onClick={() => setHistoryTab('tutors')}
            >
              👨‍🏫 Riwayat Absensi Guru Les
            </button>
            <button
              className={`tab-btn ${historyTab === 'students' ? 'active' : ''}`}
              onClick={() => setHistoryTab('students')}
            >
              🎓 Riwayat Absensi Murid Les
            </button>
          </div>

          {/* Filters Bar */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Month Filter */}
            <select
              className="form-select"
              style={{ width: '140px', padding: '0.45rem 0.8rem', fontSize: '0.825rem' }}
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="">Semua Bulan</option>
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  Bulan {i + 1} ({new Date(2026, i, 1).toLocaleString('id-ID', { month: 'long' })})
                </option>
              ))}
            </select>

            {/* Year Filter */}
            <select
              className="form-select"
              style={{ width: '100px', padding: '0.45rem 0.8rem', fontSize: '0.825rem' }}
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {[2024, 2025, 2026, 2027].map((yr) => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>

            {/* Specific Filter dropdown */}
            {historyTab === 'tutors' ? (
              <select
                className="form-select"
                style={{ width: '170px', padding: '0.45rem 0.8rem', fontSize: '0.825rem' }}
                value={selectedTutorId}
                onChange={(e) => setSelectedTutorId(e.target.value)}
              >
                <option value="">Semua Guru Les</option>
                {tutors.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            ) : (
              <select
                className="form-select"
                style={{ width: '170px', padding: '0.45rem 0.8rem', fontSize: '0.825rem' }}
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
              >
                <option value="">Semua Murid Les</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Memuat riwayat absensi...</p>
        ) : attendances.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>Tidak ada data riwayat absensi yang ditemukan.</p>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Nama Guru</th>
                  <th>Nama Murid</th>
                  <th>Kategori Les</th>
                  <th>Mata Pelajaran</th>
                  <th>Durasi</th>
                  <th>Catatan</th>
                </tr>
              </thead>
              <tbody>
                {attendances.map((att) => (
                  <tr key={att.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{att.date}</td>
                    <td style={{ fontWeight: 600, color: '#c084fc' }}>{att.tutor?.name || '-'}</td>
                    <td style={{ fontWeight: 600, color: '#818cf8' }}>{att.student?.name || '-'}</td>
                    <td>
                      <span className="badge badge-indigo">
                        {att.les_category?.name || att.lesCategory?.name || 'Les'}
                      </span>
                    </td>
                    <td>{att.subject || '-'}</td>
                    <td>{att.duration_minutes} Menit</td>
                    <td style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>{att.notes || '-'}</td>
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
