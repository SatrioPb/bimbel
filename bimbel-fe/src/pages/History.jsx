import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import Modal from '../components/Modal';
import { History as HistoryIcon, FileText, FileSpreadsheet, Plus, Edit2, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const History = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [historyTab, setHistoryTab] = useState('tutors'); // 'tutors' or 'students'
  const [attendances, setAttendances] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [students, setStudents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedTutorId, setSelectedTutorId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');

  // Form Modal State (Admin Add/Edit)
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState(null);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    tutor_id: '',
    student_id: '',
    les_category_id: '',
    subject: '',
    start_time: '15:00',
    end_time: '16:30',
    notes: ''
  });
  const [saving, setSaving] = useState(false);

  // Delete Confirmation Modal & Alert Banner State
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    id: null,
    title: ''
  });
  const [deleting, setDeleting] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [historyTab, selectedMonth, selectedYear, selectedTutorId, selectedStudentId]);

  const fetchFilterOptions = async () => {
    try {
      const [tRes, sRes, cRes] = await Promise.all([
        apiClient.getWithCache('/tutors/options').catch(() => ({ data: { data: [] } })),
        apiClient.getWithCache('/students/options').catch(() => ({ data: { data: [] } })),
        apiClient.getWithCache('/les-categories/options').catch(() => ({ data: { data: [] } }))
      ]);
      if (tRes.data?.success) setTutors(tRes.data.data);
      if (sRes.data?.success) setStudents(sRes.data.data);
      if (cRes.data?.success) setCategories(cRes.data.data);
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

      const res = await apiClient.getWithCache(endpoint, { params });
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

  // Form Modal Handlers (Admin Create / Edit)
  const handleOpenFormModal = (att = null) => {
    if (att) {
      setEditingAttendance(att);
      setForm({
        tutor_id: att.tutor_id || '',
        student_id: att.student_id || '',
        les_category_id: att.les_category_id || '',
        date: att.date || new Date().toISOString().split('T')[0],
        subject: att.subject || '',
        notes: att.notes || ''
      });
    } else {
      setEditingAttendance(null);
      setForm({
        tutor_id: tutors.length > 0 ? tutors[0].id : '',
        student_id: students.length > 0 ? students[0].id : '',
        les_category_id: categories.length > 0 ? categories[0].id : '',
        date: new Date().toISOString().split('T')[0],
        subject: '',
        notes: ''
      });
    }
    setShowFormModal(true);
  };

  const handleSaveForm = async (e) => {
    e.preventDefault();
    setSaving(true);
    setAlertMessage(null);

    try {
      if (editingAttendance) {
        await apiClient.put(`/attendances/${editingAttendance.id}`, form);
        setAlertMessage({
          type: 'success',
          text: 'Data riwayat presensi berhasil diperbarui.'
        });
      } else {
        await apiClient.post('/attendances', form);
        setAlertMessage({
          type: 'success',
          text: 'Data riwayat presensi baru berhasil ditambahkan.'
        });
      }
      setShowFormModal(false);
      fetchHistory();
    } catch (err) {
      setAlertMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Gagal menyimpan data riwayat presensi.'
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete Confirmation Handlers
  const handleDeleteRequest = (att) => {
    const tutorName = att.tutor?.name || '-';
    const studentName = att.student?.name || '-';
    setDeleteConfirm({
      show: true,
      id: att.id,
      title: `Sesi ${att.date} (Guru: ${tutorName} / Murid: ${studentName})`
    });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return;
    setDeleting(true);
    setAlertMessage(null);

    try {
      await apiClient.delete(`/attendances/${deleteConfirm.id}`);
      setDeleteConfirm({ show: false, id: null, title: '' });
      setAlertMessage({
        type: 'success',
        text: 'Data riwayat presensi berhasil dihapus.'
      });
      fetchHistory();
    } catch (err) {
      setDeleteConfirm({ show: false, id: null, title: '' });
      setAlertMessage({
        type: 'danger',
        text: err.response?.data?.message || `Gagal menghapus data: ${err.message}`
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Banner & Export Actions */}
      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge badge-indigo" style={{ marginBottom: '0.4rem' }}>📊 Export & Report</span>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
            Menu Riwayat Absensi Les
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Pantau riwayat jam mengajar guru les dan kehadiran murid les dengan filter bulan
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {isAdmin && (
            <button onClick={() => handleOpenFormModal()} className="btn btn-primary">
              <Plus size={18} />
              <span>Tambah Riwayat Baru</span>
            </button>
          )}

          <button onClick={() => handleExport('pdf')} className="btn btn-secondary" style={{ borderColor: '#fecdd3', color: '#be123c' }}>
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
        {/* Alert Feedback Banner */}
        {alertMessage && (
          <div style={{
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
            borderRadius: '10px',
            backgroundColor: alertMessage.type === 'success' ? '#ecfdf5' : '#fff1f2',
            border: `1px solid ${alertMessage.type === 'success' ? '#a7f3d0' : '#fecdd3'}`,
            color: alertMessage.type === 'success' ? '#047857' : '#be123c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.85rem',
            fontWeight: 600
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {alertMessage.type === 'success' ? <CheckCircle size={17} color="#059669" /> : <AlertTriangle size={17} color="#dc2626" />}
              <span>{alertMessage.text}</span>
            </div>
            <button
              onClick={() => setAlertMessage(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 700 }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Tabs & Filters Header */}
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
          <p style={{ color: '#64748b' }}>Memuat riwayat absensi...</p>
        ) : attendances.length === 0 ? (
          <p style={{ color: '#64748b' }}>Tidak ada data riwayat absensi yang ditemukan.</p>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
              <span className="badge badge-emerald" style={{ fontSize: '0.825rem', padding: '0.4rem 0.8rem' }}>
                💵 Total Gaji Guru Periode Ini: Rp {attendances.reduce((sum, item) => {
                  const fee = (item.tutor_fee_per_session && parseFloat(item.tutor_fee_per_session) > 0)
                    ? parseFloat(item.tutor_fee_per_session)
                    : (item.lesCategory?.tutor_fee_per_session || item.les_category?.tutor_fee_per_session || 15000);
                  return sum + parseFloat(fee);
                }, 0).toLocaleString('id-ID')}
              </span>
            </div>

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
                    <th>Gaji Guru (Honor)</th>
                    <th>Catatan</th>
                    {isAdmin && <th style={{ textAlign: 'center' }}>Aksi</th>}
                  </tr>
                </thead>
                <tbody>
                  {attendances.map((att) => {
                    const tutorFee = (att.tutor_fee_per_session && parseFloat(att.tutor_fee_per_session) > 0)
                      ? parseFloat(att.tutor_fee_per_session)
                      : parseFloat(att.lesCategory?.tutor_fee_per_session || att.les_category?.tutor_fee_per_session || 15000);

                    return (
                      <tr key={att.id}>
                        <td style={{ whiteSpace: 'nowrap', fontWeight: 500 }}>{att.date}</td>
                        <td style={{ fontWeight: 600, color: '#7c3aed' }}>{att.tutor?.name || '-'}</td>
                        <td style={{ fontWeight: 600, color: '#2563eb' }}>{att.student?.name || '-'}</td>
                        <td>
                          <span className="badge badge-indigo">
                            {att.les_category?.name || att.lesCategory?.name || 'Les'}
                          </span>
                        </td>
                        <td>{att.subject || '-'}</td>
                        <td>{att.duration_minutes} Menit</td>
                        <td style={{ fontWeight: 700, color: '#059669' }}>
                          Rp {tutorFee.toLocaleString('id-ID')}
                        </td>
                        <td style={{ fontSize: '0.825rem', color: '#64748b' }}>{att.notes || '-'}</td>
                    {isAdmin && (
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <button
                            onClick={() => handleOpenFormModal(att)}
                            className="btn btn-secondary btn-sm"
                            title="Edit Data Riwayat"
                          >
                            <Edit2 size={14} color="#2563eb" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteRequest(att)}
                            className="btn btn-danger btn-sm"
                            title="Hapus Data Riwayat"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Admin Form Modal (Tambah / Edit Riwayat Absensi) */}
      {isAdmin && (
        <Modal
          isOpen={showFormModal}
          onClose={() => setShowFormModal(false)}
          title={editingAttendance ? '✏️ Edit Data Riwayat Absensi Les' : '➕ Catat Presensi Mengajar Guru'}
        >
          <form onSubmit={handleSaveForm}>
            <div className="grid-2">
              {/* Input Nama Guru */}
              <div className="form-group">
                <label className="form-label">Nama Guru Les *</label>
                <select
                  className="form-select"
                  value={form.tutor_id}
                  onChange={(e) => setForm({ ...form, tutor_id: e.target.value })}
                  required
                >
                  <option value="">-- Pilih Guru --</option>
                  {tutors.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Input Murid */}
              <div className="form-group">
                <label className="form-label">Murid Les *</label>
                <select
                  className="form-select"
                  value={form.student_id}
                  onChange={(e) => setForm({ ...form, student_id: e.target.value })}
                  required
                >
                  <option value="">-- Pilih Murid --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name}
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
                  value={form.les_category_id}
                  onChange={(e) => setForm({ ...form, les_category_id: e.target.value })}
                  required
                >
                  <option value="">-- Pilih Kategori --</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      [{c.code}] {c.name}
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
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Mata Pelajaran (Optional) */}
            <div className="form-group">
              <label className="form-label">Mata Pelajaran (Opsional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Contoh: Matematika, Fisika (opsional)"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Catatan Sesi / Evaluasi (Opsional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Catatan hasil les..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="btn btn-secondary"
                disabled={saving}
              >
                Batal
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? 'Simpan Data...' : (editingAttendance ? 'Simpan Perubahan' : 'Simpan Presensi')}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal (Filament Style) */}
      <Modal
        isOpen={deleteConfirm.show}
        onClose={() => setDeleteConfirm({ show: false, id: null, title: '' })}
        title="⚠️ Konfirmasi Hapus Riwayat Absensi"
      >
        <div style={{ padding: '0.25rem 0' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem 1.25rem',
            backgroundColor: '#fff1f2',
            border: '1px solid #fecdd3',
            borderRadius: '12px',
            color: '#9f1239',
            marginBottom: '1rem'
          }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: '#ffe4e6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <AlertTriangle size={24} color="#dc2626" />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: '#be123c' }}>
                Apakah Anda Yakin Ingin Menghapus Data Ini?
              </h4>
              <p style={{ fontSize: '0.825rem', margin: '0.25rem 0 0 0', color: '#e11d48' }}>
                Tindakan ini akan menghapus data <strong>{deleteConfirm.title}</strong> secara permanen dari riwayat absensi.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setDeleteConfirm({ show: false, id: null, title: '' })}
              disabled={deleting}
            >
              Batal
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={confirmDelete}
              disabled={deleting}
            >
              <Trash2 size={16} />
              <span>{deleting ? 'Menghapus...' : 'Ya, Hapus Data'}</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default History;
