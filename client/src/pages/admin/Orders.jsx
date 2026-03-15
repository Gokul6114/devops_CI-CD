import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, Search, Edit2, Trash2, Eye, X, ShoppingCart } from 'lucide-react';
import { format } from 'date-fns';

const STATUSES = ['Pending', 'Processing', 'Completed', 'Delivered', 'Cancelled'];
const PROCESS_TYPES = ['Dyeing', 'Printing', 'Washing', 'Finishing', 'Embroidery', 'Other'];

function OrderModal({ order, clients, onClose, onSave }) {
  const [form, setForm] = useState(order || {
    client: '', items: [{ productName: '', quantity: 1, unit: 'meters', unitPrice: 0 }],
    deliveryDate: '', status: 'Pending', priority: 'Medium', processType: 'Dyeing',
    fabricType: '', color: '', specialInstructions: ''
  });
  const [loading, setLoading] = useState(false);

  const addItem = () => setForm({ ...form, items: [...form.items, { productName: '', quantity: 1, unit: 'meters', unitPrice: 0 }] });
  const removeItem = (i) => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) });
  const updateItem = (i, field, val) => {
    const items = [...form.items];
    items[i] = { ...items[i], [field]: field === 'quantity' || field === 'unitPrice' ? Number(val) : val };
    setForm({ ...form, items });
  };

  const total = form.items.reduce((s, item) => s + item.quantity * item.unitPrice, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (order?._id) {
        await axios.put(`/orders/${order._id}`, form);
        toast.success('Order updated');
      } else {
        await axios.post('/orders', form);
        toast.success('Order created');
      }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: '700px' }}>
        <div className="modal-header">
          <h3>{order ? 'Edit Order' : 'New Order'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20}/></button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Client *</label>
                <select className="form-select" value={form.client?._id || form.client} onChange={e => setForm({...form, client: e.target.value})} required>
                  <option value="">Select client</option>
                  {clients.map(c => <option key={c._id} value={c._id}>{c.name} - {c.company || c.email}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Delivery Date *</label>
                <input className="form-input" type="date" value={form.deliveryDate?.split('T')[0] || ''} onChange={e => setForm({...form, deliveryDate: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Process Type</label>
                <select className="form-select" value={form.processType} onChange={e => setForm({...form, processType: e.target.value})}>
                  {PROCESS_TYPES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Fabric Type</label>
                <input className="form-input" placeholder="e.g. Cotton, Polyester" value={form.fabricType} onChange={e => setForm({...form, fabricType: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Color</label>
                <input className="form-input" placeholder="e.g. Red, Navy Blue" value={form.color} onChange={e => setForm({...form, color: e.target.value})} />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <label className="form-label" style={{ margin: 0 }}>Order Items</label>
                <button type="button" className="btn btn-secondary btn-sm" onClick={addItem}><Plus size={14}/>Add Item</button>
              </div>
              {form.items.map((item, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                  <input className="form-input" placeholder="Product name" value={item.productName} onChange={e => updateItem(i, 'productName', e.target.value)} required />
                  <input className="form-input" type="number" placeholder="Qty" min="1" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} />
                  <input className="form-input" placeholder="Unit" value={item.unit} onChange={e => updateItem(i, 'unit', e.target.value)} />
                  <input className="form-input" type="number" placeholder="Price/unit" min="0" value={item.unitPrice} onChange={e => updateItem(i, 'unitPrice', e.target.value)} />
                  <button type="button" onClick={() => removeItem(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><X size={16}/></button>
                </div>
              ))}
              <div style={{ textAlign: 'right', fontWeight: 700, color: '#1e40af', fontSize: '16px' }}>Total: ₹{total.toLocaleString()}</div>
            </div>

            <div className="form-group">
              <label className="form-label">Special Instructions</label>
              <textarea className="form-textarea" value={form.specialInstructions} onChange={e => setForm({...form, specialInstructions: e.target.value})} placeholder="Any special requirements..." />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : (order ? 'Update' : 'Create Order')}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [modal, setModal] = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([axios.get('/orders'), axios.get('/users/clients')])
      .then(([o, c]) => { setOrders(o.data); setClients(c.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this order?')) return;
    await axios.delete(`/orders/${id}`);
    toast.success('Order deleted');
    load();
  };

  const filtered = orders.filter(o => {
    const matchSearch = o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      o.client?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.client?.company?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = !filter || o.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">{orders.length} total orders</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({})}><Plus size={16}/>New Order</button>
      </div>

      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', gap: '12px', flex: 1, flexWrap: 'wrap' }}>
            <div className="input-group" style={{ flex: 1, minWidth: '200px' }}>
              <Search className="input-icon" size={16}/>
              <input className="form-input" placeholder="Search orders..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="form-select" style={{ width: '160px' }} value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="">All Status</option>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        {loading ? (
          <div className="loading-container"><div className="loading-spinner"/></div>
        ) : (
          <div className="table-container">
            <table>
              <thead><tr><th>Order #</th><th>Client</th><th>Process</th><th>Amount</th><th>Delivery</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(order => (
                  <tr key={order._id}>
                    <td style={{ fontWeight: 600, color: '#2563eb' }}>{order.orderNumber}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{order.client?.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{order.client?.company}</div>
                    </td>
                    <td>{order.processType}</td>
                    <td style={{ fontWeight: 600 }}>₹{order.totalAmount?.toLocaleString()}</td>
                    <td>{order.deliveryDate ? format(new Date(order.deliveryDate), 'dd MMM yyyy') : '-'}</td>
                    <td><span className={`badge badge-${order.status?.toLowerCase()}`}>{order.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => setModal(order)}><Edit2 size={14}/></button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(order._id)}><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!filtered.length && <tr><td colSpan={7}><div className="empty-state"><ShoppingCart size={32}/><h3>No orders found</h3></div></td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal !== null && (
        <OrderModal order={modal?._id ? modal : null} clients={clients} onClose={() => setModal(null)} onSave={() => { setModal(null); load(); }} />
      )}
    </div>
  );
}