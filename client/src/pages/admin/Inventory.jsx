import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, Search, Edit2, Trash2, AlertTriangle, TrendingUp, TrendingDown, X, Package } from 'lucide-react';

const CATEGORIES = ['Raw Material', 'Dye', 'Chemical', 'Finished Goods', 'Packaging', 'Other'];

function ItemModal({ item, onClose, onSave }) {
  const [form, setForm] = useState(item || { itemName: '', category: 'Raw Material', quantity: 0, unit: 'kg', minStockLevel: 10, costPerUnit: 0, supplier: '', location: '', description: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (item?._id) { await axios.put(`/inventory/${item._id}`, form); toast.success('Item updated'); }
      else { await axios.post('/inventory', form); toast.success('Item added'); }
      onSave();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>{item ? 'Edit Item' : 'Add Inventory Item'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20}/></button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Item Name *</label>
                <input className="form-input" value={form.itemName} onChange={e => setForm({...form, itemName: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select className="form-select" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input className="form-input" type="number" min="0" value={form.quantity} onChange={e => setForm({...form, quantity: Number(e.target.value)})} />
              </div>
              <div className="form-group">
                <label className="form-label">Unit</label>
                <input className="form-input" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} placeholder="kg, liters, rolls..." />
              </div>
              <div className="form-group">
                <label className="form-label">Min Stock Level</label>
                <input className="form-input" type="number" min="0" value={form.minStockLevel} onChange={e => setForm({...form, minStockLevel: Number(e.target.value)})} />
              </div>
              <div className="form-group">
                <label className="form-label">Cost per Unit (₹)</label>
                <input className="form-input" type="number" min="0" value={form.costPerUnit} onChange={e => setForm({...form, costPerUnit: Number(e.target.value)})} />
              </div>
              <div className="form-group">
                <label className="form-label">Supplier</label>
                <input className="form-input" value={form.supplier} onChange={e => setForm({...form, supplier: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Storage Location</label>
                <input className="form-input" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : (item ? 'Update' : 'Add Item')}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function TransactionModal({ item, onClose, onSave }) {
  const [form, setForm] = useState({ type: 'IN', quantity: 0, reference: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`/inventory/${item._id}/transaction`, form);
      toast.success(`Stock ${form.type === 'IN' ? 'added' : 'removed'} successfully`);
      onSave();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: '420px' }}>
        <div className="modal-header">
          <h3>Stock Transaction: {item.itemName}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20}/></button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Transaction Type</label>
              <select className="form-select" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                <option value="IN">Stock In (Add)</option>
                <option value="OUT">Stock Out (Remove)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Quantity ({item.unit})</label>
              <input className="form-input" type="number" min="1" value={form.quantity} onChange={e => setForm({...form, quantity: Number(e.target.value)})} required />
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Current stock: {item.quantity} {item.unit}</p>
            </div>
            <div className="form-group">
              <label className="form-label">Reference (Optional)</label>
              <input className="form-input" placeholder="Order number or notes" value={form.reference} onChange={e => setForm({...form, reference: e.target.value})} />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Confirm'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AdminInventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [modal, setModal] = useState(null);
  const [txModal, setTxModal] = useState(null);

  const load = () => {
    setLoading(true);
    axios.get('/inventory').then(r => setItems(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Remove this item?')) return;
    await axios.delete(`/inventory/${id}`);
    toast.success('Item removed');
    load();
  };

  const filtered = items.filter(i => {
    const matchSearch = i.itemName?.toLowerCase().includes(search.toLowerCase()) || i.sku?.toLowerCase().includes(search.toLowerCase());
    const matchCat = !catFilter || i.category === catFilter;
    return matchSearch && matchCat;
  });

  const lowStockCount = items.filter(i => i.isLowStock).length;
  const totalValue = items.reduce((s, i) => s + i.quantity * i.costPerUnit, 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory</h1>
          <p className="page-subtitle">{items.length} items · {lowStockCount > 0 && <span style={{ color: '#ef4444' }}>{lowStockCount} low stock</span>}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({})}><Plus size={16}/>Add Item</button>
      </div>

      <div className="grid grid-3" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-icon"><Package size={22}/></div>
          <div className="stat-value">{items.length}</div>
          <div className="stat-label">Total Items</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}><AlertTriangle size={22}/></div>
          <div className="stat-value">{lowStockCount}</div>
          <div className="stat-label">Low Stock Alerts</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#d1fae5', color: '#059669' }}><TrendingUp size={22}/></div>
          <div className="stat-value">₹{(totalValue / 1000).toFixed(1)}K</div>
          <div className="stat-label">Total Stock Value</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', gap: '12px', flex: 1, flexWrap: 'wrap' }}>
            <div className="input-group" style={{ flex: 1, minWidth: '200px' }}>
              <Search className="input-icon" size={16}/>
              <input className="form-input" placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="form-select" style={{ width: '180px' }} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {loading ? <div className="loading-container"><div className="loading-spinner"/></div> : (
          <div className="table-container">
            <table>
              <thead><tr><th>Item</th><th>SKU</th><th>Category</th><th>Stock</th><th>Min Level</th><th>Cost/Unit</th><th>Value</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(item => (
                  <tr key={item._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {item.isLowStock && <AlertTriangle size={14} color="#f59e0b" />}
                        <span style={{ fontWeight: 500 }}>{item.itemName}</span>
                      </div>
                      {item.supplier && <div style={{ fontSize: '12px', color: '#64748b' }}>{item.supplier}</div>}
                    </td>
                    <td style={{ color: '#64748b', fontSize: '13px' }}>{item.sku}</td>
                    <td><span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '6px', fontSize: '12px' }}>{item.category}</span></td>
                    <td>
                      <span style={{ fontWeight: 600, color: item.isLowStock ? '#ef4444' : '#0f172a' }}>{item.quantity}</span>
                      <span style={{ color: '#64748b', marginLeft: '4px', fontSize: '12px' }}>{item.unit}</span>
                    </td>
                    <td>{item.minStockLevel} {item.unit}</td>
                    <td>₹{item.costPerUnit}</td>
                    <td style={{ fontWeight: 600 }}>₹{(item.quantity * item.costPerUnit).toLocaleString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => setTxModal(item)} title="Stock In/Out">
                          <TrendingUp size={14}/>
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => setModal(item)}><Edit2 size={14}/></button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item._id)}><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!filtered.length && <tr><td colSpan={8}><div className="empty-state"><h3>No items found</h3></div></td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal !== null && <ItemModal item={modal?._id ? modal : null} onClose={() => setModal(null)} onSave={() => { setModal(null); load(); }} />}
      {txModal && <TransactionModal item={txModal} onClose={() => setTxModal(null)} onSave={() => { setTxModal(null); load(); }} />}
    </div>
  );
}