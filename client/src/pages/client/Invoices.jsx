import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FileText, Download } from 'lucide-react';
import { format } from 'date-fns';

export default function ClientInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    axios.get('/invoices').then(r => setInvoices(r.data)).finally(() => setLoading(false));
  }, []);

  const downloadPDF = async (invoice) => {
    setDownloading(invoice._id);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/invoices/${invoice._id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to generate PDF');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice-${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Invoice downloaded!');
    } catch (err) {
      toast.error('Failed to download invoice');
    } finally {
      setDownloading(null);
    }
  };

  const totalPaid = invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.totalAmount, 0);
  const totalPending = invoices.filter(i => i.status !== 'Paid' && i.status !== 'Cancelled').reduce((s, i) => s + i.totalAmount, 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Invoices</h1>
          <p className="page-subtitle">{invoices.length} total invoices</p>
        </div>
      </div>

      <div className="grid grid-3" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-icon"><FileText size={22}/></div>
          <div className="stat-value">{invoices.length}</div>
          <div className="stat-label">Total Invoices</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#d1fae5', color: '#059669' }}><FileText size={22}/></div>
          <div className="stat-value" style={{ color: '#059669' }}>₹{totalPaid.toLocaleString()}</div>
          <div className="stat-label">Amount Paid</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}><FileText size={22}/></div>
          <div className="stat-value" style={{ color: '#d97706' }}>₹{totalPending.toLocaleString()}</div>
          <div className="stat-label">Pending Payment</div>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-container"><div className="loading-spinner"/></div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Order</th>
                  <th>Subtotal</th>
                  <th>Tax (GST)</th>
                  <th>Total Amount</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Download</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv._id}>
                    <td style={{ fontWeight: 600, color: '#2563eb' }}>{inv.invoiceNumber}</td>
                    <td style={{ color: '#64748b' }}>{inv.order?.orderNumber || '-'}</td>
                    <td>₹{inv.subtotal?.toLocaleString()}</td>
                    <td style={{ color: '#64748b' }}>₹{inv.taxAmount?.toLocaleString()} ({inv.taxRate}%)</td>
                    <td style={{ fontWeight: 700 }}>₹{inv.totalAmount?.toLocaleString()}</td>
                    <td style={{ color: '#64748b' }}>{inv.dueDate ? format(new Date(inv.dueDate), 'dd MMM yyyy') : '-'}</td>
                    <td><span className={`badge badge-${inv.status?.toLowerCase()}`}>{inv.status}</span></td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => downloadPDF(inv)}
                        disabled={downloading === inv._id}
                      >
                        <Download size={14}/>
                        {downloading === inv._id ? 'Generating...' : 'PDF'}
                      </button>
                    </td>
                  </tr>
                ))}
                {!invoices.length && (
                  <tr><td colSpan={8}><div className="empty-state"><FileText size={32}/><h3>No invoices found</h3><p>Invoices will appear once your orders are completed</p></div></td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}