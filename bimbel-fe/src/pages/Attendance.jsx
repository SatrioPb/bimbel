import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import Modal from '../components/Modal';
import { ClipboardCheck, Plus, Calendar, Clock, User, BookOpen, AlertCircle } from 'lucide-react';

const Attendance = () => {
  const [attendances, setAttendances] = useState([]);
  const [students, setStudents] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    tutor_id: '',
    student_id: '',
    les_category_id: '',
    date: new Date().toISOString().split('T')[0],
    start_time: '15:00',
    end_time: '16:30',
    duration_minutes: 90,
    subject: '',
    notes: ''
  });

  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [attRes, studRes, tutRes, catRes] = await Promise.all([
        apiClient.get('/attendances'),
        apiClient.get('/students/options').catch(() => ({ data: { data: [] } })),
        apiClient.get('/tutors/options').catch(() => ({ data: { data: [] } })),
        apiClient.get('/les-categories/options').catch(() => ({ data: { data: [] } }))
      ]);

      if (attRes.data?.success) setAttendances(attRes.data.data);
      if (studRes.data?.success) setStudents(studRes.data.data);
      if (tutRes.data?.success) setTutors(tutRes.data.data);
      if (catRes.data?.success) setCategories(catRes.data.data);
    } catch (err) {
      console.error('Error fetching attendances:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (categoryId) => {
    const selected = categories.find(c => c.id === parseInt(categoryId));
    setFormData(prev => ({
      ...prev,
      les_category_id: categoryId,
      duration_minutes: selected ? selected.default_duration : 90
    }));
  };

  const handleOpenModal = () => {
    setFormData({
      tutor_id: tutors.length > 0 ? tutors[0].id : '',
      student_id: students.length > 0 ? students[0].id : '',
      les_category_id: categories.length > 0 ? categories[0].id : '',
      date: new Date().toISOString().split('T')[0],
      start_time: '15:00',
      end_time: '16:30',
      duration_minutes: categories.length > 0 ? categories[0].default_duration : 90,
      subject: '',
      notes: ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await apiClient.post('/attendances', formData);
      if (res.data?.success) {
        setMessage({ type: 'success', text: 'Presensi mengajar berhasil dicatat!' });
        setShowModal(false);
        fetchData();
      }
    } catch (err) {
      setMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Gagal menyimpan presensi. Periksa kembali form.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {message && (
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
          border: message.type === 'success' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(244, 63, 94, 0.3)',
          color: message.type === 'success' ? '#34d399' : '#fb7185',
          fontSize: '0.85rem'
        }}>
          {message.text}
        </div>
      )}

      {/* Main Attendance List Card */}
      <div className="glass-card">
        {/* Table Header with "+ Tambah Presensi" Button on Top Right */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
              📋 Daftar Presensi Sesi Les Mengajar
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Rekapitulasi absensi sesi bimbingan belajar murid & guru les
            </p>
          </div>

          <button onClick={handleOpenModal} className="btn btn-primary">
            <Plus size={18} />
            <span>Tambah Presensi</span>
          </button>
        </div>

        {/* Attendance Table */}
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
                    <td style={{ color: '#818cf8', fontWeight: 600 }}>{att.student?.name || '-'}</td>
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

      {/* Modal Input Presensi */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Input Presensi Mengajar Guru">
        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            {/* Input Nama Guru */}
            <div className="form-group">
              <label className="form-label">Nama Guru Les *</label>
              <select
                className="form-select"
                value={formData.tutor_id}
                onChange={(e) => setFormData({ ...formData, tutor_id: e.target.value })}
                required
              >
                <option value="">-- Pilih Guru --</option>
                {tutors.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.nip_code})
                  </option>
                ))}
              </select>
            </div>

            {/* Input Murid */}
            <div className="form-group">
              <label className="form-label">Murid Les *</label>
              <select
                className="form-select"
                value={formData.student_id}
                onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                required
              >
                <option value="">-- Pilih Murid --</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.student_code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid-2">
            {/* Kategori Les (PIB, PIH, REG) */}
            <div className="form-group">
              <label className="form-label">Kategori Tipe Les *</label>
              <select
                className="form-select"
                value={formData.les_category_id}
                onChange={(e) => handleCategorySelect(e.target.value)}
                required
              >
                <option value="">-- Pilih Kategori --</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    [{c.code}] {c.name} (Rp {parseFloat(c.fee_per_session).toLocaleString('id-ID')})
                  </option>
                ))}
              </select>
            </div>

            {/* Durasi */}
            <div className="form-group">
              <label className="form-label">Durasi Waktu Les *</label>
              <select
                className="form-select"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
              >
                <option value={60}>60 Menit</option>
                <option value={90}>90 Menit</option>
              </select>
            </div>
          </div>

          <div className="grid-2">
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

            {/* Mata Pelajaran (Optional) */}
            <div className="form-group">
              <label className="form-label">Mata Pelajaran (Opsional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Contoh: Matematika, Fisika (opsional)"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Catatan Sesi / Evaluasi (Opsional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="Catatan hasil les..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Simpan Data...' : 'Simpan Presensi'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Attendance;
