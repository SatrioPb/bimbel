import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { ClipboardCheck, Plus, CheckCircle2, Clock, Calendar, BookOpen, AlertCircle } from 'lucide-react';

const Attendance = () => {
  const [attendances, setAttendances] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    student_id: '',
    date: new Date().toISOString().split('T')[0],
    start_time: '15:00',
    end_time: '16:30',
    duration_minutes: 90,
    subject: '',
    topic: '',
    status: 'hadir',
    notes: ''
  });

  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [attRes, studRes] = await Promise.all([
        apiClient.get('/attendances'),
        apiClient.get('/students/options').catch(() => apiClient.get('/database/students')).catch(() => ({ data: { data: [] } }))
      ]);

      if (attRes.data?.success) setAttendances(attRes.data.data);
      if (studRes.data?.success) setStudents(studRes.data.data);
    } catch (err) {
      console.error('Error fetching attendances:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSelect = (studentId) => {
    const selected = students.find(s => s.id === parseInt(studentId));
    setFormData(prev => ({
      ...prev,
      student_id: studentId,
      duration_minutes: selected ? selected.duration_minutes : 90
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await apiClient.post('/attendances', formData);
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Presensi mengajar berhasil disimpan!' });
        setFormData({
          student_id: '',
          date: new Date().toISOString().split('T')[0],
          start_time: '15:00',
          end_time: '16:30',
          duration_minutes: 90,
          subject: '',
          topic: '',
          status: 'hadir',
          notes: ''
        });
        fetchData();
      }
    } catch (err) {
      setMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Gagal menyimpan presensi. Pastikan data terisi dengan benar.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Form Input Presensi */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ padding: '0.5rem', borderRadius: '10px', backgroundColor: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.4)' }}>
            <ClipboardCheck size={22} color="#818cf8" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>Input Presensi Mengajar Guru</h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Catat sesi mengajar murid les harian</p>
          </div>
        </div>

        {message && (
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
            border: message.type === 'success' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(244, 63, 94, 0.3)',
            color: message.type === 'success' ? '#34d399' : '#fb7185',
            fontSize: '0.85rem',
            marginBottom: '1.25rem'
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid-3">
            {/* Murid Selector */}
            <div className="form-group">
              <label className="form-label">Pilih Murid Les *</label>
              <select
                className="form-select"
                value={formData.student_id}
                onChange={(e) => handleStudentSelect(e.target.value)}
                required
              >
                <option value="">-- Pilih Murid --</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.jenis_les.replace(/_/g, ' ')}) - {s.duration_minutes}m
                  </option>
                ))}
              </select>
            </div>

            {/* Tanggal */}
            <div className="form-group">
              <label className="form-label">Tanggal Mengajar *</label>
              <input
                type="date"
                className="form-input"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            {/* Mata Pelajaran */}
            <div className="form-group">
              <label className="form-label">Mata Pelajaran *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Contoh: Matematika, Fisika, B. Inggris"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid-3" style={{ marginTop: '0.5rem' }}>
            {/* Durasi & Waktu */}
            <div className="form-group">
              <label className="form-label">Durasi (Menit) *</label>
              <select
                className="form-select"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
              >
                <option value={60}>60 Menit</option>
                <option value={90}>90 Menit</option>
              </select>
            </div>

            {/* Status Presensi */}
            <div className="form-group">
              <label className="form-label">Status Kehadiran *</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="hadir">Hadir</option>
                <option value="izin">Izin</option>
                <option value="sakit">Sakit</option>
                <option value="alpha">Alpha</option>
              </select>
            </div>

            {/* Topik / Pembahasan */}
            <div className="form-group">
              <label className="form-label">Topik Pembelajaran</label>
              <input
                type="text"
                className="form-input"
                placeholder="Contoh: Aljabar, Grammar Tenses"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '0.5rem' }}>
            <label className="form-label">Catatan Pertemuan / Evaluasi Guru</label>
            <input
              type="text"
              className="form-input"
              placeholder="Catatan perkembangan murid saat les..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              <Plus size={18} />
              <span>{submitting ? 'Simpan Data...' : 'Simpan Presensi Mengajar'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Table Presensi Terbaru */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem' }}>
          📋 Daftar Presensi Terkini
        </h3>

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Memuat data presensi...</p>
        ) : attendances.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>Belum ada data presensi yang dicatat.</p>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Guru Les</th>
                  <th>Murid Les</th>
                  <th>Mata Pelajaran</th>
                  <th>Topik</th>
                  <th>Durasi</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendances.map((att) => (
                  <tr key={att.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{att.date}</td>
                    <td style={{ fontWeight: 600 }}>{att.tutor?.name || att.tutor_id}</td>
                    <td style={{ color: '#818cf8', fontWeight: 600 }}>{att.student?.name || att.student_id}</td>
                    <td>{att.subject}</td>
                    <td>{att.topic || '-'}</td>
                    <td>{att.duration_minutes} Menit</td>
                    <td>
                      <span className={`badge ${
                        att.status === 'hadir' ? 'badge-emerald' :
                        att.status === 'izin' ? 'badge-amber' :
                        att.status === 'sakit' ? 'badge-indigo' : 'badge-rose'
                      }`}>
                        {att.status}
                      </span>
                    </td>
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

export default Attendance;
