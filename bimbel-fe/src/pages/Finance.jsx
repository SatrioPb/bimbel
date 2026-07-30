import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';
import { Wallet, FileText, FileSpreadsheet, CheckCircle2, Clock, Plus, Download, Sparkles } from 'lucide-react';

const Finance = () => {
  const [invoices, setInvoices] = useState([]);
  const [incomeSummary, setIncomeSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  const [genMonth, setGenMonth] = useState(new Date().getMonth() + 1);
  const [genYear, setGenYear] = useState(new Date().getFullYear());
  const [generating, setGenerating] = useState(false);

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

      if (invRes.data.success) setInvoices(invRes.data.data);
      if (incRes.data.success) setIncomeSummary(incRes.data.data);
    } catch (err) {
      console.error('Error fetching finance data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvoices = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const res = await apiClient.post('/finance/invoices/generate', {
        month: genMonth,
        year: genYear
      });
      if (res.data.success) {
        alert(res.data.message || 'Invoice bulan ini berhasil dibuat!');
        setShowGenerateModal(false);
        fetchFinanceData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal membuat invoice.');
    } finally {
      setGenerating(false);
    }
  };

  const handleMarkPaid = async (invoiceId) => {
    if (!window.confirm('Tandai invoice ini sebagai LUNAS?')) return;
    try {
      const res = await apiClient.put(`/finance/invoices/${invoiceId}/pay`);
      if (res.data.success) {
        fetchFinanceData();
      }
    } catch (err) {
      alert('Gagal memperbarui status invoice: ' + err.message);
    }
  };

  const handleDownloadInvoicePdf = async (invoiceId, invNum) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/v1/finance/invoices/${invoiceId}/pdf`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', `invoice_${invNum.replace(/\//g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Gagal mengunduh PDF Invoice.');
    }
  };

  const handleExportIncome = async (format) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/v1/finance/income-summary/${format}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
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

  const totalPaidAmount = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + parseFloat(i.final_amount), 0);
  const totalUnpaidAmount = invoices.filter(i => i.status === 'unpaid').reduce((sum, i) => sum + parseFloat(i.final_amount), 0);

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
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem' }}>
          📑 Daftar Invoice Les per Wali Murid
        </h3>

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Memuat daftar invoice...</p>
        ) : invoices.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>Belum ada invoice les yang diterbitkan.</p>
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
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td style={{ fontWeight: 700, color: '#818cf8' }}>{inv.invoice_number}</td>
                    <td style={{ fontWeight: 600 }}>{inv.student?.name || inv.student_id}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{inv.student?.parent_name || '-'}</td>
                    <td>Bulan {inv.month} / {inv.year}</td>
                    <td>{inv.total_sessions} Sesi</td>
                    <td>Rp {parseFloat(inv.fee_per_session).toLocaleString('id-ID')}</td>
                    <td style={{ fontWeight: 800, color: '#ffffff' }}>
                      Rp {parseFloat(inv.final_amount).toLocaleString('id-ID')}
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
                ))}
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
