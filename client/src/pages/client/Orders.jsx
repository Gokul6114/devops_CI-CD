import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, X, ShoppingCart } from 'lucide-react';
import { format } from 'date-fns';

const PROCESS_TYPES = ['Dyeing', 'Printing', 'Washing', 'Finishing', 'Embroidery', 'Other'];

function NewOrderModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    items: [{ productName: '', quantity: 1, unit: 'meters', unitPrice: 0 }],
    deliveryDate: '', processType: 'Dyeing', fabricType: '', color: '', specialInstructions: ''
  });
  const [loading, setLoading] = useState(false);

  const addItem = () => setForm({ ...form, items: [...form.items, { productName: '', quantity: 1, unit: 'meters', unitPrice: 0 }] });
  const removeItem = (i) => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) });
  const updateItem = (i, field, val) => {
    const items = [...form.items];
    items[i] = { ...items[i], [field]: ['quantity','unitPrice'].includes(field) ? Number(val) : val };
    setForm({ ...form, items });
  };

  const total = form.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/orders', form);
      toast.success('Order placed successfully!');
      onSave();
    } catch (err) { toast.error(err.response?.data?.message || 'Error placing order'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: '680px' }}>
        <div className="modal-header">
          <h3>Place New Order</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20}/></button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Process Type *</label>
                <select className="form-select" value={form.processType} onChange={e => setForm({...form, processType: e.target.value})}>
                  {PROCESS_TYPES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Required Delivery Date *</label>
                <input className="form-input" type="date" value={form.deliveryDate} onChange={e => setForm({...form, deliveryDate: e.target.value})} required min={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="form-group">
                <label className="form-label">Fabric Type</label>
                <input className="form-input" placeholder="e.g. Cotton, Silk, Polyester" value={form.fabricType} onChange={e => setForm({...form, fabricType: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Color Requirements</label>
                <input className="form-input" placeholder="e.g. Navy Blue, Dark Red" value={form.color} onChange={e => setForm({...form, color: e.target.value})} />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <label className="form-label" style={{ margin: 0 }}>Items *</label>
                <button type="button" className="btn btn-secondary btn-sm" onClick={addItem}><Plus size={14}/>Add Item</button>
              </div>
              {form.items.map((item, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                  <input className="form-input" placeholder="Product/Fabric name" value={item.productName} onChange={e => updateItem(i, 'productName', e.target.value)} required />
                  <input className="form-input" type="number" placeholder="Qty" min="1" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} />
                  <input className="form-input" placeholder="meters" value={item.unit} onChange={e => updateItem(i, 'unit', e.target.value)} />
                  <input className="form-input" type="number" placeholder="₹/unit" min="0" value={item.unitPrice} onChange={e => updateItem(i, 'unitPrice', e.target.value)} />
                  {form.items.length > 1 && <button type="button" onClick={() => removeItem(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><X size={16}/></button>}
                </div>
              ))}
              <div style={{ textAlign: 'right', fontWeight: 700, color: '#1e40af', fontSize: '15px' }}>Estimated Total: ₹{total.toLocaleString()}</div>
            </div>

            <div className="form-group">
              <label className="form-label">Special Instructions</label>
              <textarea className="form-textarea" value={form.specialInstructions} onChange={e => setForm({...form, specialInstructions: e.target.value})} placeholder="Any specific requirements, quality standards, packaging needs..." />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Placing order...' : 'Place Order'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ClientOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('');
  const [detail, setDetail] = useState(null);

  const load = () => {
    setLoading(true);
    axios.get('/orders').then(r => setOrders(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = orders.filter(o => !filter || o.status === filter);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Orders</h1>
          <p className="page-subtitle">{orders.length} orders total</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16}/>New Order</button>
      </div>

      <div className="card">
        <div className="card-header">
          <select className="form-select" style={{ width: '180px' }} value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="">All Status</option>
            {['Pending','Processing','Completed','Delivered','Cancelled'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        {loading ? <div className="loading-container"><div className="loading-spinner"/></div> : (
          <div className="table-container">
            <table>
              <thead><tr><th>Order #</th><th>Process</th><th>Fabric</th><th>Amount</th><th>Delivery Date</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o._id} style={{ cursor: 'pointer' }} onClick={() => setDetail(o)}>
                    <td style={{ fontWeight: 600, color: '#2563eb' }}>{o.orderNumber}</td>
                    <td>{o.processType}</td>
                    <td>{o.fabricType || '-'}</td>
                    <td style={{ fontWeight: 600 }}>₹{o.totalAmount?.toLocaleString()}</td>
                    <td>{o.deliveryDate ? format(new Date(o.deliveryDate), 'dd MMM yyyy') : '-'}</td>
                    <td><span className={`badge badge-${o.status?.toLowerCase()}`}>{o.status}</span></td>
                    <td style={{ color: '#64748b' }}>{format(new Date(o.createdAt), 'dd MMM yyyy')}</td>
                  </tr>
                ))}
                {!filtered.length && <tr><td colSpan={7}><div className="empty-state"><ShoppingCart size={32}/><h3>No orders yet</h3><p>Click "New Order" to get started</p></div></td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order detail modal */}
      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="modal" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Order Details: {detail.orderNumber}</h3>
              <button onClick={() => setDetail(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20}/></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                {[
                  ['Status', <span className={`badge badge-${detail.status?.toLowerCase()}`}>{detail.status}</span>],
                  ['Process', detail.processType],
                  ['Fabric', detail.fabricType || '-'],
                  ['Color', detail.color || '-'],
                  ['Delivery', detail.deliveryDate ? format(new Date(detail.deliveryDate), 'dd MMM yyyy') : '-'],
                  ['Total', <strong>₹{detail.totalAmount?.toLocaleString()}</strong>],
                ].map(([label, value]) => (
                  <div key={label} style={{ background: '#f8fafc', borderRadius: '8px', padding: '12px' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                    <div style={{ fontSize: '14px' }}>{value}</div>
                  </div>
                ))}
              </div>
              {detail.specialInstructions && (
                <div style={{ background: '#eff6ff', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '11px', color: '#1d4ed8', marginBottom: '4px' }}>SPECIAL INSTRUCTIONS</div>
                  <div style={{ fontSize: '14px' }}>{detail.specialInstructions}</div>
                </div>
              )}
              <div>
                <h4 style={{ fontSize: '14px', marginBottom: '10px' }}>Items</h4>
                {detail.items?.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: '14px' }}>
                    <span>{item.productName} ({item.quantity} {item.unit})</span>
                    <span style={{ fontWeight: 600 }}>₹{item.totalPrice?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && <NewOrderModal onClose={() => setShowModal(false)} onSave={() => { setShowModal(false); load(); }} />}
    </div>
  );
}
