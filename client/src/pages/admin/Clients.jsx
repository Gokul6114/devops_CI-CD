import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, Search, Edit2, Users, X } from 'lucide-react';

function ClientModal({ client, onClose, onSave }) {
  const [form, setForm] = useState(client || { name: '', email: '', password: '', phone: '', company: '', address: '', role: 'client' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (client?._id) {
        const { password, ...data } = form;
        await axios.put(`/users/${client._id}`, data);
        toast.success('Client updated');
      } else {
        await axios.post('/auth/register', form);
        toast.success('Client account created');
      }
      onSave();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>{client ? 'Edit Client' : 'Add New Client'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20}/></button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="form-input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
              </div>
              {!client && (
                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input className="form-input" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength={6} />
                </div>
              )}
              <div className="form-group" style={{ gridColumn: client ? '1/-1' : 'auto' }}>
                <label className="form-label">Company</label>
                <input className="form-input" value={form.company} onChange={e => setForm({...form, company: e.target.value})} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <textarea className="form-textarea" value={form.address} onChange={e => setForm({...form, address: e.target.value})} style={{ minHeight: '70px' }} />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : (client ? 'Update' : 'Create Client')}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AdminClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);

  const load = () => {
    setLoading(true);
    axios.get('/users/clients').then(r => setClients(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = clients.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.company?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Clients</h1>
          <p className="page-subtitle">{clients.length} registered clients</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({})}><Plus size={16}/>Add Client</button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="input-group" style={{ maxWidth: '320px' }}>
            <Search className="input-icon" size={16}/>
            <input className="form-input" placeholder="Search clients..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        {loading ? <div className="loading-container"><div className="loading-spinner"/></div> : (
          <div className="table-container">
            <table>
              <thead><tr><th>Client</th><th>Email</th><th>Phone</th><th>Company</th><th>Joined</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#dbeafe', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px', flexShrink: 0 }}>{c.name?.[0]}</div>
                        <span style={{ fontWeight: 500 }}>{c.name}</span>
                      </div>
                    </td>
                    <td style={{ color: '#64748b' }}>{c.email}</td>
                    <td>{c.phone || '-'}</td>
                    <td>{c.company || '-'}</td>
                    <td style={{ color: '#64748b' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => setModal(c)}><Edit2 size={14}/></button>
                    </td>
                  </tr>
                ))}
                {!filtered.length && <tr><td colSpan={6}><div className="empty-state"><Users size={32}/><h3>No clients found</h3></div></td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal !== null && <ClientModal client={modal?._id ? modal : null} onClose={() => setModal(null)} onSave={() => { setModal(null); load(); }} />}
    </div>
  );
}
