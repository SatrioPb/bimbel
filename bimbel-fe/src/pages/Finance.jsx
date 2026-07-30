import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';
import { Wallet, FileText, FileSpreadsheet, CheckCircle2, Clock, Plus, Download, Search, Filter } from 'lucide-react';

const Finance = () => {
  const [invoices, setInvoices] = useState([]);
  const [incomeSummary, setIncomeSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'paid', 'unpaid'

  // Generate Modal State
  const [genMonth, setGenMonth] = useState(new Date().getMonth() + 1);
  const [genYear, setGenYear] = useState(new Date().getFullYear());
  const [generating, setGenerating] = useState(false);

  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      const [invRes, incRes] = await Promise.all([
        apiClient.get('/finance/invoices'),
        apiClient.get('/finance/income-summary')
      ]);

      if (invRes.data?.success) setInvoices(invRes.data.data);
      if (incRes.data?.success) setIncomeSummary(incRes.data.data);
    } catch (err) {
      console.error('Error fetching finance data:', err);
    } finally {
      setLoading(false);
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
        fetchFinanceData();
      }
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Gagal membuat invoice.' });
    } finally {
      setGenerating(false);
    }
  };

  const handleMarkPaid = async (invoiceId) => {
    if (!window.confirm('Konfirmasi: Tandai invoice ini sebagai LUNAS?')) return;
    try {
      const res = await apiClient.put(`/finance/invoices/${invoiceId}/pay`, {
        status: 'paid'
      });
      if (res.data?.success) {
        setMessage({ type: 'success', text: 'Status pembayaran berhasil diperbarui menjadi LUNAS.' });
        fetchFinanceData();
      }
    } catch (err) {
      alert('Gagal memperbarui status invoice: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDownloadInvoicePdf = async (invoiceId, invNum) => {
    try {
      const response = await apiClient.get(`/finance/invoices/${invoiceId}/pdf`, {
        responseType: 'blob'
      });
      const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = blobUrl;
      const safeNo = (invNum || 'invoice').replace(/[\/\\]/g, '_');
      link.setAttribute('download', `Invoice_${safeNo}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Gagal mengunduh PDF Invoice.');
    }
  };

  const handleExportIncome = async (format) => {
    try {
      const response = await apiClient.get(`/finance/income-summary/${format}`, {
        responseType: 'blob'
      });
      const mimeType = format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: mimeType }));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', `laporan_pemasukan_${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert(`Gagal mengeksport berkas ${format}.`);
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    const term = search.toLowerCase();
    const invNo = inv.invoice_number?.toLowerCase() || '';
    const studentName = inv.student?.name?.toLowerCase() || '';
    const parentName = inv.student?.parent_name?.toLowerCase() || '';
    const matchesSearch = invNo.includes(term) || studentName.includes(term) || parentName.includes(term);

    return matchesStatus && matchesSearch;
  });

  const totalPaidAmount = invoices
    .filter(i => i.status === 'paid')
    .reduce((sum, i) => sum + (parseFloat(i.final_amount) || 0), 0);

  const totalUnpaidAmount = invoices
    .filter(i => i.status === 'unpaid')
    .reduce((sum, i) => sum + (parseFloat(i.final_amount) || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Banner & Export Actions */}
      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge badge-amber" style={{ marginBottom: '0.4rem' }}>💰 Administrator Only</span>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
            Menu Keuangan & Invoice Les
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Kelola tagihan les bulanan wali murid dan pantau total pemasukan bimbel
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={() => setShowGenerateModal(true)} className="btn btn-primary">
            <Plus size={18} />
            <span>Generate Invoice Bulan Ini</span>
          </button>
          <button onClick={() => handleExportIncome('pdf')} className="btn btn-secondary" style={{ borderColor: 'rgba(244, 63, 94, 0.4)', color: '#fb7185' }}>
            <FileText size={18} />
            <span>Rekap PDF</span>
          </button>
          <button onClick={() => handleExportIncome('excel')} className="btn btn-emerald">
            <FileSpreadsheet size={18} />
            <span>Rekap Excel</span>
          </button>
        </div>
      </div>

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

      {/* Summary Cards */}
      <div className="grid-3">
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

      {/* Table Invoices */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
            📑 Daftar Invoice Les per Wali Murid ({filteredInvoices.length})
          </h3>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '220px' }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
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
              style={{ width: '150px', padding: '0.45rem 0.8rem', fontSize: '0.825rem' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Semua Status</option>
              <option value="paid">LUNAS</option>
              <option value="unpaid">BELUM BAYAR</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Memuat daftar invoice...</p>
        ) : filteredInvoices.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>Tidak ada invoice les yang sesuai dengan filter.</p>
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
                      <td style={{ fontWeight: 700, color: '#818cf8' }}>{inv.invoice_number}</td>
                      <td style={{ fontWeight: 600 }}>{inv.student?.name || inv.student_id}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{inv.student?.parent_name || '-'}</td>
                      <td>Bulan {inv.month} / {inv.year}</td>
                      <td>{inv.total_sessions} Sesi</td>
                      <td>Rp {fee.toLocaleString('id-ID')}</td>
                      <td style={{ fontWeight: 800, color: '#ffffff' }}>
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
                              onClick={() => handleMarkPaid(inv.id)}
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
                            <FileText size={14} color="#fb7185" />
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

      {/* Modal Generate Invoice */}
      <Modal isOpen={showGenerateModal} onClose={() => setShowGenerateModal(false)} title="Generate Invoice Les Bulanan">
        <form onSubmit={handleGenerateInvoices}>
          <div className="form-group">
            <label className="form-label">Pilih Bulan</label>
            <select className="form-select" value={genMonth} onChange={(e) => setGenMonth(parseInt(e.target.value))}>
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  Bulan {i + 1} ({new Date(2026, i, 1).toLocaleString('id-ID', { month: 'long' })})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Pilih Tahun</label>
            <input
              type="number"
              className="form-input"
              value={genYear}
              onChange={(e) => setGenYear(parseInt(e.target.value))}
            />
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={() => setShowGenerateModal(false)} className="btn btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn btn-primary" disabled={generating}>
              {generating ? 'Memproses Invoice...' : 'Generate Invoice Now'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Finance;
