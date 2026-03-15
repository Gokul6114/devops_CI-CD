import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, FileText, CheckCircle, Clock, Truck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';

export default function ClientDashboard() {
  const [orders, setOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    Promise.all([axios.get('/orders'), axios.get('/invoices')])
      .then(([o, i]) => { setOrders(o.data); setInvoices(i.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-container"><div className="loading-spinner"/></div>;

  const stats = [
    { label: 'Total Orders', value: orders.length, icon: ShoppingCart, color: '#3b82f6', bg: '#dbeafe' },
    { label: 'Pending', value: orders.filter(o => o.status === 'Pending').length, icon: Clock, color: '#f59e0b', bg: '#fef3c7' },
    { label: 'Completed', value: orders.filter(o => ['Completed','Delivered'].includes(o.status)).length, icon: CheckCircle, color: '#10b981', bg: '#d1fae5' },
    { label: 'Invoices', value: invoices.length, icon: FileText, color: '#8b5cf6', bg: '#ede9fe' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome, {user?.name?.split(' ')[0]}!</h1>
          <p className="page-subtitle">Here's a summary of your orders and invoices</p>
        </div>
        <span style={{ fontSize: '13px', color: '#64748b' }}>{format(new Date(), 'EEEE, MMMM d, yyyy')}</span>
      </div>

      <div className="grid grid-4" style={{ marginBottom: '28px' }}>
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Icon size={20} color={color} />
            </div>
            <div style={{ fontSize: '26px', fontWeight: 700, color: '#0f172a', fontFamily: 'Outfit, sans-serif' }}>{value}</div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-header"><h3 style={{ fontSize: '16px' }}>Recent Orders</h3></div>
          <div className="table-container">
            <table>
              <thead><tr><th>Order #</th><th>Process</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>
                {orders.slice(0, 6).map(o => (
                  <tr key={o._id}>
                    <td style={{ fontWeight: 600, color: '#2563eb' }}>{o.orderNumber}</td>
                    <td>{o.processType}</td>
                    <td>₹{o.totalAmount?.toLocaleString()}</td>
                    <td><span className={`badge badge-${o.status?.toLowerCase()}`}>{o.status}</span></td>
                  </tr>
                ))}
                {!orders.length && <tr><td colSpan={4} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>No orders yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3 style={{ fontSize: '16px' }}>Recent Invoices</h3></div>
          <div className="table-container">
            <table>
              <thead><tr><th>Invoice #</th><th>Amount</th><th>Due Date</th><th>Status</th></tr></thead>
              <tbody>
                {invoices.slice(0, 6).map(i => (
                  <tr key={i._id}>
                    <td style={{ fontWeight: 600, color: '#2563eb' }}>{i.invoiceNumber}</td>
                    <td style={{ fontWeight: 600 }}>₹{i.totalAmount?.toLocaleString()}</td>
                    <td style={{ color: '#64748b' }}>{i.dueDate ? format(new Date(i.dueDate), 'dd MMM') : '-'}</td>
                    <td><span className={`badge badge-${i.status?.toLowerCase()}`}>{i.status}</span></td>
                  </tr>
                ))}
                {!invoices.length && <tr><td colSpan={4} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>No invoices yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
