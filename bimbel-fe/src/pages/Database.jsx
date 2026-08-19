import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import Modal from '../components/Modal';
import { Database as DbIcon, Plus, Edit2, Trash2, Tag, BookOpen, ShieldAlert, KeyRound, UserCheck } from 'lucide-react';

const Database = () => {
  const [activeTab, setActiveTab] = useState('students'); // 'students', 'tutors', 'categories', 'teachers'
  const [students, setStudents] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [teacherAccounts, setTeacherAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Student Form Modal State
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentForm, setStudentForm] = useState({
    student_code: '',
    name: '',
    parent_name: '',
    parent_phone: '',
    address: ''
  });

  // Tutor Form Modal State
  const [showTutorModal, setShowTutorModal] = useState(false);
  const [editingTutor, setEditingTutor] = useState(null);
  const [tutorForm, setTutorForm] = useState({
    name: '',
    phone: '',
    nip_code: '',
    specialization: ''
  });

  // Category Form Modal State
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [catForm, setCatForm] = useState({
    code: '',
    name: '',
    default_duration: 90,
    fee_per_session: 15000
  });

  // Teacher Login Account Form Modal State
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [teacherForm, setTeacherForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'students') {
        const res = await apiClient.get('/database/students');
        if (res.data?.success) setStudents(res.data.data);
      } else if (activeTab === 'tutors') {
        const res = await apiClient.get('/database/tutors');
        if (res.data?.success) setTutors(res.data.data);
      } else if (activeTab === 'categories') {
        const res = await apiClient.get('/database/les-categories');
        if (res.data?.success) setCategories(res.data.data);
      } else if (activeTab === 'teachers') {
        const res = await apiClient.get('/database/teacher-accounts');
        if (res.data?.success) setTeacherAccounts(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching database:', err);
    } finally {
      setLoading(false);
    }
  };

  // Student Modal Handlers
  const handleOpenStudentModal = (student = null) => {
    if (student) {
      setEditingStudent(student);
      setStudentForm({
        student_code: student.student_code,
        name: student.name,
        parent_name: student.parent_name,
        parent_phone: student.parent_phone,
        address: student.address || ''
      });
    } else {
      setEditingStudent(null);
      setStudentForm({
        student_code: `M${new Date().getFullYear()}${Math.floor(100 + Math.random() * 900)}`,
        name: '',
        parent_name: '',
        parent_phone: '',
        address: ''
      });
    }
    setShowStudentModal(true);
  };

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

  // Tutor Modal Handlers
  const handleOpenTutorModal = (tutor = null) => {
    if (tutor) {
      setEditingTutor(tutor);
      setTutorForm({
        name: tutor.name || '',
        phone: tutor.phone || '',
        nip_code: tutor.nip_code || '',
        specialization: tutor.specialization || ''
      });
    } else {
      setEditingTutor(null);
      setTutorForm({
        name: '',
        phone: '',
        nip_code: `G${new Date().getFullYear()}${Math.floor(100 + Math.random() * 900)}`,
        specialization: ''
      });
    }
    setShowTutorModal(true);
  };

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

  // Category Modal Handlers
  const handleOpenCatModal = (cat = null) => {
    if (cat) {
      setEditingCat(cat);
      setCatForm({
        code: cat.code,
        name: cat.name,
        default_duration: cat.default_duration,
        fee_per_session: cat.fee_per_session
      });
    } else {
      setEditingCat(null);
      setCatForm({
        code: '',
        name: '',
        default_duration: 90,
        fee_per_session: 15000
      });
    }
    setShowCatModal(true);
  };

  const handleSaveCat = async (e) => {
    e.preventDefault();
    try {
      if (editingCat) {
        await apiClient.put(`/database/les-categories/${editingCat.id}`, catForm);
      } else {
        await apiClient.post('/database/les-categories', catForm);
      }
      setShowCatModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan kategori les.');
    }
  };

  // Teacher Login Account Handlers
  const handleOpenTeacherModal = (account = null) => {
    if (account) {
      setEditingTeacher(account);
      setTeacherForm({
        name: account.name || '',
        email: account.email || '',
        password: '',
        phone: account.phone || ''
      });
    } else {
      setEditingTeacher(null);
      setTeacherForm({
        name: '',
        email: '',
        password: 'password123',
        phone: ''
      });
    }
    setShowTeacherModal(true);
  };

  const handleSaveTeacher = async (e) => {
    e.preventDefault();
    try {
      if (editingTeacher) {
        await apiClient.put(`/database/teacher-accounts/${editingTeacher.id}`, teacherForm);
      } else {
        await apiClient.post('/database/teacher-accounts', teacherForm);
      }
      setShowTeacherModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan akun guru.');
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
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
            Menu Database Les
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Kelola data Murid Les, Data Profil Guru Les, Kategori Tipe Les, serta Akun Login Guru
          </p>
        </div>

        <div>
          {activeTab === 'students' ? (
            <button onClick={() => handleOpenStudentModal()} className="btn btn-primary">
              <Plus size={18} />
              <span>Tambah Murid Baru</span>
            </button>
          ) : activeTab === 'tutors' ? (
            <button onClick={() => handleOpenTutorModal()} className="btn btn-emerald">
              <Plus size={18} />
              <span>Tambah Guru Baru</span>
            </button>
          ) : activeTab === 'categories' ? (
            <button onClick={() => handleOpenCatModal()} className="btn btn-secondary" style={{ borderColor: '#2563eb', color: '#2563eb' }}>
              <Plus size={18} />
              <span>Tambah Kategori Tipe Les</span>
            </button>
          ) : (
            <button onClick={() => handleOpenTeacherModal()} className="btn btn-emerald">
              <Plus size={18} />
              <span>Tambah Akun Login Guru</span>
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
          <button
            className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            🏷️ Kategori Tipe Les ({categories.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'teachers' ? 'active' : ''}`}
            onClick={() => setActiveTab('teachers')}
          >
            🔑 Akun Login Guru ({teacherAccounts.length})
          </button>
        </div>

        {loading ? (
          <p style={{ color: '#64748b' }}>Memuat data database...</p>
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
                  <th>Alamat Rumah</th>
                  <th style={{ textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 700, color: '#2563eb' }}>{s.student_code}</td>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>{s.name}</td>
                    <td>{s.parent_name}</td>
                    <td style={{ color: '#64748b' }}>{s.parent_phone}</td>
                    <td>{s.address || '-'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button onClick={() => handleOpenStudentModal(s)} className="btn btn-secondary btn-sm">
                          <Edit2 size={14} color="#2563eb" />
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
        ) : activeTab === 'tutors' ? (
          /* Table Guru (Tarif removed) */
          <div>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Kode Guru</th>
                    <th>Nama Guru</th>
                    <th>No HP</th>
                    <th>Spesialisasi</th>
                    <th style={{ textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {tutors.map((t) => (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 700, color: '#7c3aed' }}>{t.nip_code}</td>
                      <td style={{ fontWeight: 600, color: '#0f172a' }}>{t.name}</td>
                      <td>{t.phone || '-'}</td>
                      <td>{t.specialization || '-'}</td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <button onClick={() => handleOpenTutorModal(t)} className="btn btn-secondary btn-sm">
                            <Edit2 size={14} color="#7c3aed" />
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
          </div>
        ) : activeTab === 'categories' ? (
          /* Table Kategori Les */
          <div>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Kode Tipe</th>
                    <th>Nama Kategori Les</th>
                    <th>Durasi Waktu</th>
                    <th>Tarif Biaya Les</th>
                    <th style={{ textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((c) => {
                    const fee = parseFloat(c.fee_per_session || 0);

                    return (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 700, color: '#2563eb' }}>
                          <span className="badge badge-indigo">{c.code}</span>
                        </td>
                        <td style={{ fontWeight: 600, color: '#0f172a' }}>{c.name}</td>
                        <td>{c.default_duration} Menit</td>
                        <td style={{ fontWeight: 700, color: '#059669' }}>
                          Rp {fee.toLocaleString('id-ID')}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                            <button onClick={() => handleOpenCatModal(c)} className="btn btn-secondary btn-sm">
                              <Edit2 size={14} color="#2563eb" />
                              <span>Edit</span>
                            </button>
                            <button onClick={() => handleDelete(c.id, 'les-categories')} className="btn btn-danger btn-sm">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Table Akun Login Guru */
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Nama Pengguna</th>
                  <th>Email Login</th>
                  <th>No HP</th>
                  <th>Role Hak Akses</th>
                  <th style={{ textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {teacherAccounts.map((acc) => (
                  <tr key={acc.id}>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>{acc.name}</td>
                    <td style={{ color: '#2563eb', fontWeight: 600 }}>{acc.email}</td>
                    <td>{acc.phone || '-'}</td>
                    <td>
                      <span className="badge badge-emerald">GURU LES</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button onClick={() => handleOpenTeacherModal(acc)} className="btn btn-secondary btn-sm">
                          <Edit2 size={14} color="#059669" />
                          <span>Edit</span>
                        </button>
                        <button onClick={() => handleDelete(acc.id, 'teacher-accounts')} className="btn btn-danger btn-sm">
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

          <div className="form-group">
            <label className="form-label">Alamat Rumah</label>
            <input
              type="text"
              className="form-input"
              placeholder="Alamat domisili murid"
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

      {/* Modal Tutor Form (Tarif Input Removed, NIP -> Kode Guru) */}
      <Modal
        isOpen={showTutorModal}
        onClose={() => setShowTutorModal(false)}
        title={editingTutor ? 'Edit Data Guru Les' : 'Tambah Guru Les Baru'}
      >
        <form onSubmit={handleSaveTutor}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Kode Guru *</label>
              <input
                type="text"
                className="form-input"
                value={tutorForm.nip_code}
                onChange={(e) => setTutorForm({ ...tutorForm, nip_code: e.target.value })}
                required
              />
            </div>
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
          </div>

          <div className="grid-2">
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

      {/* Modal Category Form */}
      <Modal
        isOpen={showCatModal}
        onClose={() => setShowCatModal(false)}
        title={editingCat ? 'Edit Kategori Tipe Les' : 'Tambah Kategori Tipe Les Baru'}
      >
        <form onSubmit={handleSaveCat}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Kode Tipe Les * (PIB, PIH, REG)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Kode misal: PIB"
                value={catForm.code}
                onChange={(e) => setCatForm({ ...catForm, code: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Nama Kategori Les *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Contoh: Privat In Bimbel"
                value={catForm.name}
                onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid-2" style={{ marginTop: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Durasi Waktu Default *</label>
              <select
                className="form-select"
                value={catForm.default_duration}
                onChange={(e) => setCatForm({ ...catForm, default_duration: parseInt(e.target.value) })}
                required
              >
                <option value={60}>60 Menit</option>
                <option value={90}>90 Menit</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Tarif Biaya Les / Sesi (Rp) *</label>
              <input
                type="number"
                className="form-input"
                placeholder="Contoh: 30000"
                value={catForm.fee_per_session}
                onChange={(e) => setCatForm({ ...catForm, fee_per_session: parseFloat(e.target.value) })}
                required
              />
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={() => setShowCatModal(false)} className="btn btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              Simpan Kategori Les
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Teacher Login Account Form */}
      <Modal
        isOpen={showTeacherModal}
        onClose={() => setShowTeacherModal(false)}
        title={editingTeacher ? 'Edit Akun Login Guru' : 'Tambah Akun Login Guru Baru'}
      >
        <form onSubmit={handleSaveTeacher}>
          <div className="form-group">
            <label className="form-label">Nama Guru *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Nama lengkap guru"
              value={teacherForm.name}
              onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
              required
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Email Login Guru *</label>
              <input
                type="email"
                className="form-input"
                placeholder="guru@bimbel.com"
                value={teacherForm.email}
                onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Password {editingTeacher ? '(Kosongkan jika tidak diubah)' : '*'}
              </label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={teacherForm.password}
                onChange={(e) => setTeacherForm({ ...teacherForm, password: e.target.value })}
                required={!editingTeacher}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">No. HP Guru (Opsional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="0812xxxxxxxx"
              value={teacherForm.phone}
              onChange={(e) => setTeacherForm({ ...teacherForm, phone: e.target.value })}
            />
          </div>

          <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={() => setShowTeacherModal(false)} className="btn btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn btn-emerald">
              Simpan Akun Guru
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Database;
