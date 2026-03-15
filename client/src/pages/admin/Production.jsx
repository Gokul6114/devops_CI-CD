import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, Search, Edit2, Trash2, X, Factory } from 'lucide-react';
import { format } from 'date-fns';

const STATUSES = ['Scheduled', 'In Progress', 'Completed', 'On Hold', 'Cancelled'];
const PROCESS_TYPES = ['Dyeing', 'Printing', 'Washing', 'Finishing', 'Embroidery', 'Other'];

function BatchModal({ batch, orders, onClose, onSave }) {
  const [form, setForm] = useState(batch || { order: '', processType: 'Dyeing', status: 'Scheduled', quantity: 0, unit: 'meters', startDate: '', estimatedCompletionDate: '', assignedTo: '', machine: '', notes: '', progress: 0 });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (batch?._id) { await axios.put(`/production/${batch._id}`, form); toast.success('Batch updated'); }
      else { await axios.post('/production', form); toast.success('Batch created'); }
      onSave();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: '620px' }}>
        <div className="modal-header">
          <h3>{batch ? 'Edit Production Batch' : 'New Production Batch'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20}/></button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Linked Order</label>
                <select className="form-select" value={form.order?._id || form.order} onChange={e => setForm({...form, order: e.target.value})}>
                  <option value="">No linked order</option>
                  {orders.map(o => <option key={o._id} value={o._id}>{o.orderNumber}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Process Type *</label>
                <select className="form-select" value={form.processType} onChange={e => setForm({...form, processType: e.target.value})}>
                  {PROCESS_TYPES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input className="form-input" type="number" min="0" value={form.quantity} onChange={e => setForm({...form, quantity: Number(e.target.value)})} />
              </div>
              <div className="form-group">
                <label className="form-label">Unit</label>
                <input className="form-input" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Progress (%)</label>
                <input className="form-input" type="number" min="0" max="100" value={form.progress} onChange={e => setForm({...form, progress: Number(e.target.value)})} />
              </div>
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input className="form-input" type="date" value={form.startDate?.split('T')[0] || ''} onChange={e => setForm({...form, startDate: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Est. Completion Date</label>
                <input className="form-input" type="date" value={form.estimatedCompletionDate?.split('T')[0] || ''} onChange={e => setForm({...form, estimatedCompletionDate: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Assigned To</label>
                <input className="form-input" value={form.assignedTo} onChange={e => setForm({...form, assignedTo: e.target.value})} placeholder="Staff name" />
              </div>
              <div className="form-group">
                <label className="form-label">Machine</label>
                <input className="form-input" value={form.machine} onChange={e => setForm({...form, machine: e.target.value})} placeholder="Machine ID/name" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-textarea" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : (batch ? 'Update' : 'Create Batch')}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const statusColor = { 'Scheduled': '#dbeafe', 'In Progress': '#fef3c7', 'Completed': '#d1fae5', 'On Hold': '#fee2e2', 'Cancelled': '#f1f5f9' };
const statusText = { 'Scheduled': '#1e40af', 'In Progress': '#92400e', 'Completed': '#065f46', 'On Hold': '#991b1b', 'Cancelled': '#475569' };

export default function AdminProduction() {
  const [batches, setBatches] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([axios.get('/production'), axios.get('/orders')])
      .then(([p, o]) => { setBatches(p.data); setOrders(o.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this batch?')) return;
    await axios.delete(`/production/${id}`);
    toast.success('Batch deleted');
    load();
  };

  const filtered = batches.filter(b =>
    b.batchNumber?.toLowerCase().includes(search.toLowerCase()) ||
    b.processType?.toLowerCase().includes(search.toLowerCase()) ||
    b.assignedTo?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Production</h1>
          <p className="page-subtitle">{batches.length} production batches</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({})}><Plus size={16}/>New Batch</button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="input-group" style={{ maxWidth: '320px' }}>
            <Search className="input-icon" size={16}/>
            <input className="form-input" placeholder="Search batches..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        {loading ? <div className="loading-container"><div className="loading-spinner"/></div> : (
          <div className="table-container">
            <table>
              <thead><tr><th>Batch #</th><th>Process</th><th>Order</th><th>Quantity</th><th>Progress</th><th>Assigned To</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(batch => (
                  <tr key={batch._id}>
                    <td style={{ fontWeight: 600, color: '#2563eb' }}>{batch.batchNumber}</td>
                    <td>{batch.processType}</td>
                    <td style={{ color: '#64748b' }}>{batch.order?.orderNumber || '-'}</td>
                    <td>{batch.quantity} {batch.unit}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '3px', minWidth: '80px' }}>
                          <div style={{ width: `${batch.progress}%`, height: '100%', background: '#3b82f6', borderRadius: '3px', transition: 'width 0.3s' }} />
                        </div>
                        <span style={{ fontSize: '12px', color: '#64748b', minWidth: '32px' }}>{batch.progress}%</span>
                      </div>
                    </td>
                    <td>{batch.assignedTo || '-'}</td>
                    <td>
                      <span style={{ background: statusColor[batch.status], color: statusText[batch.status], padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>
                        {batch.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => setModal(batch)}><Edit2 size={14}/></button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(batch._id)}><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!filtered.length && <tr><td colSpan={8}><div className="empty-state"><Factory size={32}/><h3>No batches found</h3></div></td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal !== null && <BatchModal batch={modal?._id ? modal : null} orders={orders} onClose={() => setModal(null)} onSave={() => { setModal(null); load(); }} />}
    </div>
  );
}
