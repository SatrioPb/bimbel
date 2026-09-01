import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';
import { Wallet, FileText, FileSpreadsheet, CheckCircle2, Clock, Plus, Download, Search, Filter, AlertCircle, Sparkles, AlertTriangle, RefreshCw, Users, UserCheck } from 'lucide-react';

const Finance = () => {
  const [financeTab, setFinanceTab] = useState('invoices'); // 'invoices' or 'tutor_salaries'
  const [invoices, setInvoices] = useState([]);
  const [incomeSummary, setIncomeSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Tutor Salaries State
  const [tutorSalariesData, setTutorSalariesData] = useState(null);
  const [salaryMonth, setSalaryMonth] = useState(new Date().getMonth() + 1);
  const [salaryYear, setSalaryYear] = useState(new Date().getFullYear());
  const [loadingSalaries, setLoadingSalaries] = useState(false);

  // Modals
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [confirmPaidModal, setConfirmPaidModal] = useState(false);
  const [selectedInvoiceForPay, setSelectedInvoiceForPay] = useState(null);
  const [paying, setPaying] = useState(false);

  const currentMonthNum = new Date().getMonth() + 1;
  const currentYearNum = new Date().getFullYear();

  // Filters for Invoices
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'paid', 'unpaid'
  const [monthFilter, setMonthFilter] = useState(currentMonthNum.toString());
  const [yearFilter, setYearFilter] = useState(currentYearNum.toString());

  // Generate Modal State
  const [genMonth, setGenMonth] = useState(currentMonthNum);
  const [genYear, setGenYear] = useState(currentYearNum);
  const [generating, setGenerating] = useState(false);

  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchFinanceData();
  }, []);

  useEffect(() => {
    if (financeTab === 'tutor_salaries') {
      fetchTutorSalaries();
    }
  }, [financeTab, salaryMonth, salaryYear]);

  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      const [invRes, incRes] = await Promise.all([
        apiClient.getWithCache('/finance/invoices'),
        apiClient.getWithCache('/finance/income-summary')
      ]);

      if (invRes.data?.success) setInvoices(invRes.data.data);
      if (incRes.data?.success) setIncomeSummary(incRes.data.data);
    } catch (err) {
      console.error('Error fetching finance data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTutorSalaries = async () => {
    setLoadingSalaries(true);
    try {
      const res = await apiClient.getWithCache('/finance/tutor-salaries', {
        params: { month: salaryMonth, year: salaryYear }
      });
      if (res.data?.success) {
        setTutorSalariesData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching tutor salaries:', err);
    } finally {
      setLoadingSalaries(false);
    }
  };

  const handleGenerateInvoices = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setMessage(null);
    try {
      const res = await apiClient.post('/finance/invoices/generate', {
        month: genMonth,
        year: genYear
      });
      if (res.data?.success) {
        setMessage({ type: 'success', text: res.data.message || 'Invoice bulan ini berhasil dibuat!' });
        setShowGenerateModal(false);
        setMonthFilter(genMonth.toString());
        setYearFilter(genYear.toString());
        fetchFinanceData();
      }
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Gagal membuat invoice.' });
    } finally {
      setGenerating(false);
    }
  };

  // Open Pay Confirmation Modal
  const handleOpenPayConfirm = (inv) => {
    setSelectedInvoiceForPay(inv);
    setConfirmPaidModal(true);
  };

  // Execute Mark Paid
  const handleConfirmPay = async () => {
    if (!selectedInvoiceForPay) return;
    setPaying(true);
    const invNo = selectedInvoiceForPay.invoice_number;

    try {
      const res = await apiClient.put(`/finance/invoices/${selectedInvoiceForPay.id}/pay`, {
        status: 'paid'
      });
      if (res.data?.success) {
        setMessage({
          type: 'success',
          text: `Status pembayaran Invoice [${invNo}] berhasil ditandai LUNAS!`
        });
        setConfirmPaidModal(false);
        fetchFinanceData();
      }
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Gagal mengubah status pembayaran.' });
    } finally {
      setPaying(false);
      setSelectedInvoiceForPay(null);
    }
  };

  const handleDownloadInvoicePdf = async (invoiceId, invoiceNo) => {
    try {
      const response = await apiClient.get(`/finance/invoices/${invoiceId}/pdf`, {
        responseType: 'blob'
      });
      const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = blobUrl;
      const safeInvoiceNo = invoiceNo.replace(/[\/\\]/g, '_');
      link.setAttribute('download', `Invoice_${safeInvoiceNo}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Gagal mendownload PDF Invoice.');
    }
  };

  const handleExportIncome = async (format) => {
    try {
      const response = await apiClient.get(`/finance/income-summary/${format}?year=${yearFilter === 'all' ? currentYearNum : yearFilter}`, {
        responseType: 'blob'
      });
      const mimeType = format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: mimeType }));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', `rekap_pemasukan_${new Date().getFullYear()}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert(`Gagal mengeksport rekap pemasukan ${format}.`);
    }
  };

  const handleExportTutorSalaries = async (format) => {
    try {
      const response = await apiClient.get(`/finance/tutor-salaries/${format}?month=${salaryMonth}&year=${salaryYear}`, {
        responseType: 'blob'
      });
      const mimeType = format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: mimeType }));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', `rekap_gaji_guru_${salaryMonth}_${salaryYear}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert(`Gagal mengeksport rekap gaji guru ${format}.`);
    }
  };

  const handleExportIndividualTutorSalary = async (tutorId, tutorName) => {
    try {
      const response = await apiClient.get(`/finance/tutor-salaries/${tutorId}/pdf?month=${salaryMonth}&year=${salaryYear}`, {
        responseType: 'blob'
      });
      const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = blobUrl;
      const safeName = tutorName.replace(/[^A-Za-z0-9]/g, '_');
      link.setAttribute('download', `Slip_Gaji_${safeName}_${salaryMonth}_${salaryYear}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Gagal mendownload Slip Gaji PDF guru ini.');
    }
  };

  // Filter Logic for Invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchSearch =
      inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      (inv.student?.name && inv.student.name.toLowerCase().includes(search.toLowerCase())) ||
      (inv.student?.parent_name && inv.student.parent_name.toLowerCase().includes(search.toLowerCase()));

    const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
    const matchMonth = monthFilter === 'all' || inv.month === parseInt(monthFilter);
    const matchYear = yearFilter === 'all' || inv.year === parseInt(yearFilter);

    return matchSearch && matchStatus && matchMonth && matchYear;
  });

  // Calculate totals forStatCards
  const totalPaidAmount = invoices
    .filter(i => i.status === 'paid' && (monthFilter === 'all' || i.month === parseInt(monthFilter)) && (yearFilter === 'all' || i.year === parseInt(yearFilter)))
    .reduce((sum, i) => sum + parseFloat(i.final_amount || 0), 0);

  const totalUnpaidAmount = invoices
    .filter(i => i.status === 'unpaid' && (monthFilter === 'all' || i.month === parseInt(monthFilter)) && (yearFilter === 'all' || i.year === parseInt(yearFilter)))
    .reduce((sum, i) => sum + parseFloat(i.final_amount || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Banner */}
      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge badge-emerald" style={{ marginBottom: '0.4rem' }}>💰 Financial Control</span>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
            Menu Keuangan & Rekapitulasi Gaji
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Kelola tagihan les bulanan wali murid dan pantau rekapitulasi gaji guru les per bulan
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {financeTab === 'invoices' ? (
            <>
              <button onClick={() => setShowGenerateModal(true)} className="btn btn-primary">
                <Plus size={18} />
                <span>Generate Invoice Bulan Ini</span>
              </button>
              <button onClick={() => handleExportIncome('pdf')} className="btn btn-secondary" style={{ borderColor: '#fecdd3', color: '#be123c' }}>
                <FileText size={18} />
                <span>Rekap PDF</span>
              </button>
              <button onClick={() => handleExportIncome('excel')} className="btn btn-emerald">
                <FileSpreadsheet size={18} />
                <span>Rekap Excel</span>
              </button>
            </>
          ) : (
            <>
              <button onClick={() => handleExportTutorSalaries('pdf')} className="btn btn-secondary" style={{ borderColor: '#fecdd3', color: '#be123c' }}>
                <FileText size={18} />
                <span>Export PDF Rekap Gaji</span>
              </button>
              <button onClick={() => handleExportTutorSalaries('excel')} className="btn btn-emerald">
                <FileSpreadsheet size={18} />
                <span>Export Excel Rekap Gaji</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Notification Banner */}
      {message && (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span
            className={`badge ${message.type === 'success' ? 'badge-emerald' : 'badge-rose'}`}
            style={{
              padding: '0.65rem 1.1rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              gap: '0.6rem',
              boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.05)'
            }}
          >
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{message.text}</span>
          </span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="glass-card">
        {/* Navigation Tabs */}
        <div className="tabs-container" style={{ marginBottom: '1.25rem' }}>
          <button
            className={`tab-btn ${financeTab === 'invoices' ? 'active' : ''}`}
            onClick={() => setFinanceTab('invoices')}
          >
            📑 Tagihan Invoice Les Murid ({filteredInvoices.length})
          </button>
          <button
            className={`tab-btn ${financeTab === 'tutor_salaries' ? 'active' : ''}`}
            onClick={() => {
              setFinanceTab('tutor_salaries');
              fetchTutorSalaries();
            }}
          >
            💵 Rekap Gaji Guru Les ({tutorSalariesData?.tutors_count || 0})
          </button>
        </div>

        {financeTab === 'invoices' ? (
          /* TAB INVOICES */
          <div>
            {/* Stat Cards inside Tab */}
            <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
              <StatCard
                title="Total Pemasukan Lunas"
                value={`Rp ${totalPaidAmount.toLocaleString('id-ID')}`}
                icon={CheckCircle2}
                color="emerald"
                subtext="Tagihan yang telah dibayar"
              />
              <StatCard
                title="Menunggu Pembayaran"
                value={`Rp ${totalUnpaidAmount.toLocaleString('id-ID')}`}
                icon={Clock}
                color="amber"
                subtext="Invoice terbit (unpaid)"
              />
              <StatCard
                title="Total Sesi Les Terbayar"
                value={`${invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.total_sessions || 0), 0)} Sesi`}
                icon={Wallet}
                color="indigo"
                subtext="Aktivitas les terbayar"
              />
            </div>

            {/* Filter Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                Daftar Tagihan Invoice Bulanan
              </h3>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: '180px' }}>
                  <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '2.2rem', padding: '0.45rem 0.8rem', fontSize: '0.825rem' }}
                    placeholder="Cari invoice/murid..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <select
                  className="form-select"
                  style={{ width: '140px', padding: '0.45rem 0.8rem', fontSize: '0.825rem' }}
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value)}
                >
                  <option value="all">Semua Bulan</option>
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Bulan {i + 1} ({new Date(2026, i, 1).toLocaleString('id-ID', { month: 'long' })})
                    </option>
                  ))}
                </select>

                <select
                  className="form-select"
                  style={{ width: '100px', padding: '0.45rem 0.8rem', fontSize: '0.825rem' }}
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                >
                  <option value="all">Semua Thn</option>
                  {[2024, 2025, 2026, 2027].map((yr) => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>

                <select
                  className="form-select"
                  style={{ width: '130px', padding: '0.45rem 0.8rem', fontSize: '0.825rem' }}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Semua Status</option>
                  <option value="paid">LUNAS</option>
                  <option value="unpaid">BELUM BAYAR</option>
                </select>

                <button
                  onClick={() => fetchFinanceData()}
                  className="btn btn-secondary"
                  style={{ padding: '0.45rem 0.8rem', fontSize: '0.825rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  title="Refresh Data Invoice"
                  disabled={loading}
                >
                  <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {loading ? (
              <p style={{ color: '#64748b' }}>Memuat daftar invoice...</p>
            ) : filteredInvoices.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748b' }}>
                <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>Tidak ada invoice les yang sesuai dengan filter periode saat ini.</p>
                <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Gunakan pilihan filter "Semua Bulan" atau tekan Refresh untuk melihat seluruh riwayat tagihan.</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>No. Invoice</th>
                      <th>Murid Les</th>
                      <th>Wali Murid</th>
                      <th>Bulan / Tahun</th>
                      <th>Total Sesi</th>
                      <th>Tarif / Sesi</th>
                      <th>Total Tagihan</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'center' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map((inv) => {
                      const fee = parseFloat(inv.fee_per_session || 0);
                      const finalAmt = parseFloat(inv.final_amount || 0);

                      return (
                        <tr key={inv.id}>
                          <td style={{ fontWeight: 700, color: '#2563eb' }}>{inv.invoice_number}</td>
                          <td style={{ fontWeight: 600, color: '#0f172a' }}>{inv.student?.name || inv.student_id}</td>
                          <td style={{ color: '#64748b' }}>{inv.student?.parent_name || '-'}</td>
                          <td>Bulan {inv.month} / {inv.year}</td>
                          <td>{inv.total_sessions} Sesi</td>
                          <td>Rp {fee.toLocaleString('id-ID')}</td>
                          <td style={{ fontWeight: 800, color: '#0f172a' }}>
                            Rp {finalAmt.toLocaleString('id-ID')}
                          </td>
                          <td>
                            <span className={`badge ${inv.status === 'paid' ? 'badge-emerald' : 'badge-rose'}`}>
                              {inv.status === 'paid' ? 'LUNAS' : 'BELUM BAYAR'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                              {inv.status === 'unpaid' && (
                                <button
                                  onClick={() => handleOpenPayConfirm(inv)}
                                  className="btn btn-emerald btn-sm"
                                >
                                  <CheckCircle2 size={14} />
                                  <span>Tandai Lunas</span>
                                </button>
                              )}
                              <button
                                onClick={() => handleDownloadInvoicePdf(inv.id, inv.invoice_number)}
                                className="btn btn-secondary btn-sm"
                                title="Download PDF Invoice"
                              >
                                <FileText size={14} color="#be123c" />
                                <span>PDF</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          /* TAB REKAP GAJI GURU LES */
          <div>
            {/* Stat Cards for Payroll */}
            <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
              <StatCard
                title={`Total Gaji Guru (${tutorSalariesData?.month_name || ''} ${tutorSalariesData?.year || ''})`}
                value={`Rp ${(tutorSalariesData?.total_payroll || 0).toLocaleString('id-ID')}`}
                icon={Wallet}
                color="emerald"
                subtext="Total pengeluaran honor mengajar"
              />
              <StatCard
                title="Jumlah Guru Les Aktif Mengajar"
                value={`${tutorSalariesData?.tutors_count || 0} Orang`}
                icon={UserCheck}
                color="indigo"
                subtext="Guru yang mencatatkan sesi les"
              />
            </div>

            {/* Filter Bar for Salary */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                Rekapitulasi Gaji Guru Les Bulanan
              </h3>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <select
                  className="form-select"
                  style={{ width: '140px', padding: '0.45rem 0.8rem', fontSize: '0.825rem' }}
                  value={salaryMonth}
                  onChange={(e) => setSalaryMonth(parseInt(e.target.value))}
                >
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Bulan {i + 1} ({new Date(2026, i, 1).toLocaleString('id-ID', { month: 'long' })})
                    </option>
                  ))}
                </select>

                <select
                  className="form-select"
                  style={{ width: '100px', padding: '0.45rem 0.8rem', fontSize: '0.825rem' }}
                  value={salaryYear}
                  onChange={(e) => setSalaryYear(parseInt(e.target.value))}
                >
                  {[2024, 2025, 2026, 2027].map((yr) => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>

                <button
                  onClick={() => fetchTutorSalaries()}
                  className="btn btn-secondary"
                  style={{ padding: '0.45rem 0.8rem', fontSize: '0.825rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  disabled={loadingSalaries}
                >
                  <RefreshCw size={14} style={{ animation: loadingSalaries ? 'spin 1s linear infinite' : 'none' }} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {loadingSalaries ? (
              <p style={{ color: '#64748b' }}>Memuat rekap gaji guru les...</p>
            ) : !tutorSalariesData || tutorSalariesData.tutor_salaries.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748b' }}>
                <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>Belum ada aktivitas mengajar guru les pada periode {salaryMonth}/{salaryYear}.</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th width="5%">No</th>
                      <th>NIP / Kode</th>
                      <th>Nama Guru Les</th>
                      <th>Murid Yang Diajar</th>
                      <th style={{ textAlign: 'center' }}>Total Sesi</th>
                      <th>Rincian Kategori Sesi</th>
                      <th style={{ textAlign: 'right' }}>Total Rekap Gaji (Rp)</th>
                      <th style={{ textAlign: 'center' }}>Cetak Slip Gaji</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tutorSalariesData.tutor_salaries.map((t, idx) => (
                      <tr key={t.tutor_id}>
                        <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                        <td style={{ fontWeight: 700, color: '#7c3aed' }}>{t.nip_code}</td>
                        <td style={{ fontWeight: 600, color: '#0f172a' }}>{t.name}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                            {t.students_taught.map((st, i) => (
                              <span key={i} className="badge badge-indigo" style={{ fontSize: '0.75rem' }}>
                                🎓 {st}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 700 }}>{t.total_sessions} Sesi</td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.8rem' }}>
                            {Object.entries(t.category_breakdown).map(([code, count]) => (
                              <span key={code} style={{ color: '#475569' }}>
                                <strong>{code}:</strong> {count} Sesi
                              </span>
                            ))}
                          </div>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 800, color: '#059669', fontSize: '0.95rem' }}>
                          Rp {t.total_salary.toLocaleString('id-ID')}
                        </td>
                        <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                          <button
                            onClick={() => handleExportIndividualTutorSalary(t.tutor_id, t.name)}
                            className="btn btn-secondary btn-sm"
                            style={{ borderColor: '#fecdd3', color: '#be123c' }}
                            title="Download Slip Gaji PDF Guru Ini"
                          >
                            <FileText size={14} color="#be123c" />
                            <span>Slip Gaji PDF</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Generate Invoice Modal */}
      <Modal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        title="✨ Generate Tagihan Invoice Bulanan"
      >
        <form onSubmit={handleGenerateInvoices}>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
            Pilih periode bulan & tahun untuk membuat otomatis tagihan invoice murid les berdasarkan aktivitas presensi mengajar.
          </p>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Pilih Bulan *</label>
              <select
                className="form-select"
                value={genMonth}
                onChange={(e) => setGenMonth(parseInt(e.target.value))}
                required
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Bulan {i + 1} ({new Date(2026, i, 1).toLocaleString('id-ID', { month: 'long' })})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Pilih Tahun *</label>
              <select
                className="form-select"
                value={genYear}
                onChange={(e) => setGenYear(parseInt(e.target.value))}
                required
              >
                {[2024, 2025, 2026, 2027].map((yr) => (
                  <option key={yr} value={yr}>{yr}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={() => setShowGenerateModal(false)} className="btn btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn btn-primary" disabled={generating}>
              <Sparkles size={16} />
              <span>{generating ? 'Memproses Invoice...' : 'Generate Invoice'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Modal Yes/No for Tandai Lunas */}
      <Modal
        isOpen={confirmPaidModal}
        onClose={() => setConfirmPaidModal(false)}
        title="Konfirmasi Pembayaran Tagihan"
      >
        <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}>
            <CheckCircle2 size={32} color="#059669" />
          </div>

          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
            Tandai Tagihan Sebagai LUNAS?
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
            Apakah Anda yakin ingin memproses status pembayaran invoice berikut menjadi LUNAS?
          </p>

          {selectedInvoiceForPay && (
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '1rem 1.25rem',
              textAlign: 'left',
              marginBottom: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
              fontSize: '0.85rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>No. Invoice:</span>
                <strong style={{ color: '#2563eb' }}>{selectedInvoiceForPay.invoice_number}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Nama Murid:</span>
                <strong style={{ color: '#0f172a' }}>{selectedInvoiceForPay.student?.name || selectedInvoiceForPay.student_id}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Wali Murid:</span>
                <span>{selectedInvoiceForPay.student?.parent_name || '-'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #cbd5e1', paddingTop: '0.4rem', marginTop: '0.2rem' }}>
                <span style={{ color: '#64748b' }}>Total Tagihan:</span>
                <strong style={{ color: '#059669', fontSize: '1rem' }}>
                  Rp {parseFloat(selectedInvoiceForPay.final_amount || 0).toLocaleString('id-ID')}
                </strong>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setConfirmPaidModal(false)}
              disabled={paying}
            >
              Batal
            </button>
            <button
              type="button"
              className="btn btn-emerald"
              onClick={handleConfirmPay}
              disabled={paying}
            >
              <CheckCircle2 size={16} />
              <span>{paying ? 'Memproses...' : 'Ya, Tandai Lunas'}</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Finance;
