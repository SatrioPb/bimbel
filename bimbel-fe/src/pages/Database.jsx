import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import Modal from '../components/Modal';
import { Database as DbIcon, Plus, Edit2, Trash2, Users, UserCheck, ShieldAlert } from 'lucide-react';

const Database = () => {
  const [activeTab, setActiveTab] = useState('students'); // 'students' or 'tutors'
  const [students, setStudents] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Student Form Modal State
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentForm, setStudentForm] = useState({
    student_code: '',
    name: '',
    parent_name: '',
    parent_phone: '',
    address: '',
    jenis_les: 'reguler',
    duration_minutes: 90,
    fee_per_session: 75000,
    status: 'active'
  });

  // Tutor Form Modal State
  const [showTutorModal, setShowTutorModal] = useState(false);
  const [editingTutor, setEditingTutor] = useState(null);
  const [tutorForm, setTutorForm] = useState({
    name: '',
    email: '',
    password: 'password123',
    phone: '',
    nip_code: '',
    specialization: '',
    rate_per_session: 100000
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'students') {
        const res = await apiClient.get('/database/students');
        if (res.data.success) setStudents(res.data.data);
      } else {
        const res = await apiClient.get('/database/tutors');
        if (res.data.success) setTutors(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching database:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Student Open Modal
  const handleOpenStudentModal = (student = null) => {
    if (student) {
      setEditingStudent(student);
      setStudentForm({
        student_code: student.student_code,
        name: student.name,
        parent_name: student.parent_name,
        parent_phone: student.parent_phone,
        address: student.address || '',
        jenis_les: student.jenis_les,
        duration_minutes: student.duration_minutes,
        fee_per_session: student.fee_per_session,
        status: student.status
      });
    } else {
      setEditingStudent(null);
      setStudentForm({
        student_code: `M${new Date().getFullYear()}${Math.floor(100 + Math.random() * 900)}`,
        name: '',
        parent_name: '',
        parent_phone: '',
        address: '',
        jenis_les: 'reguler',
        duration_minutes: 90,
        fee_per_session: 75000,
        status: 'active'
      });
    }
    setShowStudentModal(true);
  };

  // Submit Student
  const handleSaveStudent = async (e) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await apiClient.put(`/database/students/${editingStudent.id}`, studentForm);
      } else {
        await apiClient.post('/database/students', studentForm);
      }
      setShowStudentModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan data murid.');
    }
  };

  // Handle Tutor Open Modal
  const handleOpenTutorModal = (tutor = null) => {
    if (tutor) {
      setEditingTutor(tutor);
      setTutorForm({
        name: tutor.user?.name || '',
        email: tutor.user?.email || '',
        password: '',
        phone: tutor.user?.phone || '',
        nip_code: tutor.nip_code,
        specialization: tutor.specialization || '',
        rate_per_session: tutor.rate_per_session
      });
    } else {
      setEditingTutor(null);
      setTutorForm({
        name: '',
        email: '',
        password: 'password123',
        phone: '',
        nip_code: `G${new Date().getFullYear()}${Math.floor(100 + Math.random() * 900)}`,
        specialization: '',
        rate_per_session: 100000
      });
    }
    setShowTutorModal(true);
  };

  // Submit Tutor
  const handleSaveTutor = async (e) => {
    e.preventDefault();
    try {
      if (editingTutor) {
        await apiClient.put(`/database/tutors/${editingTutor.id}`, tutorForm);
      } else {
        await apiClient.post('/database/tutors', tutorForm);
      }
      setShowTutorModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan data guru.');
    }
  };

  // Delete Item
  const handleDelete = async (id, type) => {
    if (!window.confirm(`Hapus data ${type} ini?`)) return;
    try {
      await apiClient.delete(`/database/${type}/${id}`);
      fetchData();
    } catch (err) {
      alert(`Gagal menghapus data: ${err.message}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Banner */}
      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge badge-amber" style={{ marginBottom: '0.4rem' }}>🛡️ Admin Only</span>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
            Menu Database Murid & Guru Les
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Kelola data murid les, jenis les (Reguler, Privat In House, Privat In Bimbel), serta data guru pengajar
          </p>
        </div>

        <div>
          {activeTab === 'students' ? (
            <button onClick={() => handleOpenStudentModal()} className="btn btn-primary">
              <Plus size={18} />
              <span>Tambah Murid Baru</span>
            </button>
          ) : (
            <button onClick={() => handleOpenTutorModal()} className="btn btn-emerald">
              <Plus size={18} />
              <span>Tambah Guru Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="glass-card">
        {/* Tabs */}
        <div className="tabs-container">
          <button
            className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            🎓 Database Murid Les ({students.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'tutors' ? 'active' : ''}`}
            onClick={() => setActiveTab('tutors')}
          >
            👨‍🏫 Database Guru Les ({tutors.length})
          </button>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Memuat data database...</p>
        ) : activeTab === 'students' ? (
          /* Table Murid */
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Kode Murid</th>
                  <th>Nama Murid</th>
                  <th>Wali Murid</th>
                  <th>No HP Wali</th>
                  <th>Jenis Les</th>
                  <th>Durasi</th>
                  <th>Biaya / Sesi</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 700, color: '#818cf8' }}>{s.student_code}</td>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td>{s.parent_name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{s.parent_phone}</td>
                    <td>
                      <span className={`badge ${
                        s.jenis_les === 'reguler' ? 'badge-indigo' :
                        s.jenis_les === 'privat_in_house' ? 'badge-purple' : 'badge-emerald'
                      }`}>
                        {s.jenis_les.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>{s.duration_minutes} Menit</td>
                    <td>Rp {parseFloat(s.fee_per_session).toLocaleString('id-ID')}</td>
                    <td>
                      <span className={`badge ${s.status === 'active' ? 'badge-emerald' : 'badge-rose'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button onClick={() => handleOpenStudentModal(s)} className="btn btn-secondary btn-sm">
                          <Edit2 size={14} color="#818cf8" />
                          <span>Edit</span>
                        </button>
                        <button onClick={() => handleDelete(s.id, 'students')} className="btn btn-danger btn-sm">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Table Guru */
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>NIP Code</th>
                  <th>Nama Guru</th>
                  <th>Email</th>
                  <th>No HP</th>
                  <th>Spesialisasi</th>
                  <th>Tarif / Sesi</th>
                  <th style={{ textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {tutors.map((t) => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 700, color: '#c084fc' }}>{t.nip_code}</td>
                    <td style={{ fontWeight: 600 }}>{t.user?.name || '-'}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{t.user?.email || '-'}</td>
                    <td>{t.user?.phone || '-'}</td>
                    <td>{t.specialization || '-'}</td>
                    <td style={{ fontWeight: 700, color: '#34d399' }}>
                      Rp {parseFloat(t.rate_per_session).toLocaleString('id-ID')}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button onClick={() => handleOpenTutorModal(t)} className="btn btn-secondary btn-sm">
                          <Edit2 size={14} color="#c084fc" />
                          <span>Edit</span>
                        </button>
                        <button onClick={() => handleDelete(t.id, 'tutors')} className="btn btn-danger btn-sm">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Student Form */}
      <Modal
        isOpen={showStudentModal}
        onClose={() => setShowStudentModal(false)}
        title={editingStudent ? 'Edit Data Murid Les' : 'Tambah Murid Les Baru'}
      >
        <form onSubmit={handleSaveStudent}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Kode Murid</label>
              <input
                type="text"
                className="form-input"
                value={studentForm.student_code}
                onChange={(e) => setStudentForm({ ...studentForm, student_code: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Nama Murid *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Nama lengkap murid"
                value={studentForm.name}
                onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Nama Wali Murid *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Orang tua / Wali"
                value={studentForm.parent_name}
                onChange={(e) => setStudentForm({ ...studentForm, parent_name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">No. HP Wali *</label>
              <input
                type="text"
                className="form-input"
                placeholder="0812xxxxxxxx"
                value={studentForm.parent_phone}
                onChange={(e) => setStudentForm({ ...studentForm, parent_phone: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Jenis Les *</label>
              <select
                className="form-select"
                value={studentForm.jenis_les}
                onChange={(e) => {
                  const val = e.target.value;
                  setStudentForm({
                    ...studentForm,
                    jenis_les: val,
                    duration_minutes: val === 'reguler' ? 90 : studentForm.duration_minutes
                  });
                }}
              >
                <option value="reguler">Reguler (90 Menit)</option>
                <option value="privat_in_house">Privat In House (Rumah)</option>
                <option value="privat_in_bimbel">Privat In Bimbel (Tempat Les)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Durasi Waktu Les *</label>
              <select
                className="form-select"
                value={studentForm.duration_minutes}
                onChange={(e) => setStudentForm({ ...studentForm, duration_minutes: parseInt(e.target.value) })}
                disabled={studentForm.jenis_les === 'reguler'}
              >
                {studentForm.jenis_les === 'reguler' ? (
                  <option value={90}>90 Menit (Fixed Reguler)</option>
                ) : (
                  <>
                    <option value={60}>60 Menit</option>
                    <option value={90}>90 Menit</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Tarif Biaya / Sesi (Rp) *</label>
              <input
                type="number"
                className="form-input"
                value={studentForm.fee_per_session}
                onChange={(e) => setStudentForm({ ...studentForm, fee_per_session: parseFloat(e.target.value) })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Status Murid *</label>
              <select
                className="form-select"
                value={studentForm.status}
                onChange={(e) => setStudentForm({ ...studentForm, status: e.target.value })}
              >
                <option value="active">Aktif</option>
                <option value="inactive">Non-Aktif</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Alamat Rumah</label>
            <input
              type="text"
              className="form-input"
              placeholder="Alamat domisili"
              value={studentForm.address}
              onChange={(e) => setStudentForm({ ...studentForm, address: e.target.value })}
            />
          </div>

          <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={() => setShowStudentModal(false)} className="btn btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              Simpan Data Murid
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Tutor Form */}
      <Modal
        isOpen={showTutorModal}
        onClose={() => setShowTutorModal(false)}
        title={editingTutor ? 'Edit Data Guru Les' : 'Tambah Guru Les Baru'}
      >
        <form onSubmit={handleSaveTutor}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Nama Guru *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Nama & Gelar"
                value={tutorForm.name}
                onChange={(e) => setTutorForm({ ...tutorForm, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Akun Guru *</label>
              <input
                type="email"
                className="form-input"
                placeholder="guru@bimbel.com"
                value={tutorForm.email}
                onChange={(e) => setTutorForm({ ...tutorForm, email: e.target.value })}
                required
              />
            </div>
          </div>

          {!editingTutor && (
            <div className="form-group">
              <label className="form-label">Password Akun Baru *</label>
              <input
                type="password"
                className="form-input"
                value={tutorForm.password}
                onChange={(e) => setTutorForm({ ...tutorForm, password: e.target.value })}
                required
              />
            </div>
          )}

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Kode NIP Guru *</label>
              <input
                type="text"
                className="form-input"
                value={tutorForm.nip_code}
                onChange={(e) => setTutorForm({ ...tutorForm, nip_code: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">No. HP Guru</label>
              <input
                type="text"
                className="form-input"
                placeholder="0812xxxxxxxx"
                value={tutorForm.phone}
                onChange={(e) => setTutorForm({ ...tutorForm, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Spesialisasi Mata Pelajaran</label>
              <input
                type="text"
                className="form-input"
                placeholder="Contoh: Matematika & IPA"
                value={tutorForm.specialization}
                onChange={(e) => setTutorForm({ ...tutorForm, specialization: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Tarif Honor Guru / Sesi (Rp) *</label>
              <input
                type="number"
                className="form-input"
                value={tutorForm.rate_per_session}
                onChange={(e) => setTutorForm({ ...tutorForm, rate_per_session: parseFloat(e.target.value) })}
                required
              />
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={() => setShowTutorModal(false)} className="btn btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn btn-emerald">
              Simpan Data Guru
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Database;
