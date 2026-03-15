import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, Search, Edit2, Trash2, X, FileText } from 'lucide-react';
import { format } from 'date-fns';

function InvoiceModal({ invoice, orders, onClose, onSave }) {
  const [form, setForm] = useState(invoice || { order: '', taxRate: 18, discount: 0, dueDate: '', notes: '', status: 'Draft' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (invoice?._id) { await axios.put(`/invoices/${invoice._id}`, form); toast.success('Invoice updated'); }
      else { await axios.post('/invoices', form); toast.success('Invoice created'); }
      onSave();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h3>{invoice ? 'Edit Invoice' : 'Create Invoice'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20}/></button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            {!invoice && (
              <div className="form-group">
                <label className="form-label">Order *</label>
                <select className="form-select" value={form.order} onChange={e => setForm({...form, order: e.target.value})} required>
                  <option value="">Select completed order</option>
                  {orders.filter(o => ['Completed','Delivered'].includes(o.status)).map(o => (
                    <option key={o._id} value={o._id}>{o.orderNumber} - {o.client?.name} (₹{o.totalAmount?.toLocaleString()})</option>
                  ))}
                </select>
              </div>
            )}
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Tax Rate (%)</label>
                <input className="form-input" type="number" min="0" max="100" value={form.taxRate} onChange={e => setForm({...form, taxRate: Number(e.target.value)})} />
              </div>
              <div className="form-group">
                <label className="form-label">Discount (₹)</label>
                <input className="form-input" type="number" min="0" value={form.discount} onChange={e => setForm({...form, discount: Number(e.target.value)})} />
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input className="form-input" type="date" value={form.dueDate?.split('T')[0] || ''} onChange={e => setForm({...form, dueDate: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                  {['Draft','Sent','Paid','Overdue','Cancelled'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-textarea" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} style={{ minHeight: '70px' }} />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : (invoice ? 'Update' : 'Create Invoice')}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AdminInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([axios.get('/invoices'), axios.get('/orders')])
      .then(([inv, ord]) => { setInvoices(inv.data); setOrders(ord.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this invoice?')) return;
    await axios.delete(`/invoices/${id}`);
    toast.success('Invoice deleted');
    load();
  };

  const filtered = invoices.filter(i =>
    i.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
    i.client?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.totalAmount, 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Invoices</h1>
          <p className="page-subtitle">{invoices.length} invoices · ₹{totalRevenue.toLocaleString()} collected</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({})}><Plus size={16}/>Create Invoice</button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="input-group" style={{ maxWidth: '320px' }}>
            <Search className="input-icon" size={16}/>
            <input className="form-input" placeholder="Search invoices..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        {loading ? <div className="loading-container"><div className="loading-spinner"/></div> : (
          <div className="table-container">
            <table>
              <thead><tr><th>Invoice #</th><th>Client</th><th>Order</th><th>Amount</th><th>Due Date</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(inv => (
                  <tr key={inv._id}>
                    <td style={{ fontWeight: 600, color: '#2563eb' }}>{inv.invoiceNumber}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{inv.client?.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{inv.client?.company}</div>
                    </td>
                    <td style={{ color: '#64748b' }}>{inv.order?.orderNumber || '-'}</td>
                    <td style={{ fontWeight: 700 }}>₹{inv.totalAmount?.toLocaleString()}</td>
                    <td style={{ color: '#64748b' }}>{inv.dueDate ? format(new Date(inv.dueDate), 'dd MMM yyyy') : '-'}</td>
                    <td><span className={`badge badge-${inv.status?.toLowerCase()}`}>{inv.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => setModal(inv)}><Edit2 size={14}/></button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(inv._id)}><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!filtered.length && <tr><td colSpan={7}><div className="empty-state"><FileText size={32}/><h3>No invoices found</h3></div></td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal !== null && <InvoiceModal invoice={modal?._id ? modal : null} orders={orders} onClose={() => setModal(null)} onSave={() => { setModal(null); load(); }} />}
    </div>
  );
}
