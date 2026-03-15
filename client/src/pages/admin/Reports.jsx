import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Download, TrendingUp, Users, Package, ShoppingCart } from 'lucide-react';

export default function AdminReports() {
  const [dashboard, setDashboard] = useState(null);
  const [sales, setSales] = useState([]);
  const [clientStats, setClientStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('sales');

  useEffect(() => {
    Promise.all([axios.get('/reports/dashboard'), axios.get('/reports/sales'), axios.get('/reports/clients')])
      .then(([d, s, c]) => { setDashboard(d.data); setSales(s.data); setClientStats(c.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-container"><div className="loading-spinner"/></div>;

  const tabs = [
    { id: 'sales', label: 'Sales Report', icon: TrendingUp },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'clients', label: 'Client Report', icon: Users },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-subtitle">Comprehensive business insights</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-4" style={{ marginBottom: '28px' }}>
        <div className="stat-card">
          <div className="stat-icon"><TrendingUp size={22}/></div>
          <div className="stat-value">₹{(dashboard?.totalRevenue / 1000).toFixed(1)}K</div>
          <div className="stat-label">Total Revenue</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}><ShoppingCart size={22}/></div>
          <div className="stat-value">{dashboard?.orderStats?.reduce((s, o) => s + o.count, 0) || 0}</div>
          <div className="stat-label">Total Orders</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#d1fae5', color: '#059669' }}><Users size={22}/></div>
          <div className="stat-value">{clientStats.length}</div>
          <div className="stat-label">Active Clients</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}><Package size={22}/></div>
          <div className="stat-value">₹{(dashboard?.inventoryStats?.totalValue / 1000).toFixed(1)}K</div>
          <div className="stat-label">Inventory Value</div>
        </div>
      </div>

      {/* Tab navigation */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: 'white', padding: '6px', borderRadius: '10px', border: '1px solid #e2e8f0', width: 'fit-content' }}>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            background: tab === id ? '#2563eb' : 'transparent',
            color: tab === id ? 'white' : '#64748b',
            fontWeight: 500, fontSize: '14px', transition: 'all 0.15s',
            fontFamily: "'DM Sans', sans-serif",
          }}>
            <Icon size={15}/>{label}
          </button>
        ))}
      </div>

      {/* Sales tab */}
      {tab === 'sales' && (
        <div className="grid grid-2">
          <div className="card">
            <div className="card-header"><h3 style={{ fontSize: '16px' }}>Monthly Revenue (₹)</h3></div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={sales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                  <XAxis dataKey="month" tick={{ fontSize: 12 }}/>
                  <YAxis tick={{ fontSize: 12 }}/>
                  <Tooltip formatter={v => ['₹' + v.toLocaleString(), 'Revenue']}/>
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><h3 style={{ fontSize: '16px' }}>Monthly Orders</h3></div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={sales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                  <XAxis dataKey="month" tick={{ fontSize: 12 }}/>
                  <YAxis tick={{ fontSize: 12 }}/>
                  <Tooltip/>
                  <Line type="monotone" dataKey="orders" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 5, fill: '#2563eb' }}/>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card" style={{ gridColumn: '1/-1' }}>
            <div className="card-header"><h3 style={{ fontSize: '16px' }}>Monthly Summary</h3></div>
            <div className="table-container">
              <table>
                <thead><tr><th>Month</th><th>Orders</th><th>Revenue</th><th>Avg. Order Value</th></tr></thead>
                <tbody>
                  {sales.map(s => (
                    <tr key={s.month+s.year}>
                      <td>{s.month} {s.year}</td>
                      <td>{s.orders}</td>
                      <td style={{ fontWeight: 600 }}>₹{s.revenue.toLocaleString()}</td>
                      <td>{s.orders ? '₹' + Math.round(s.revenue / s.orders).toLocaleString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Inventory tab */}
      {tab === 'inventory' && (
        <div className="card">
          <div className="card-header"><h3 style={{ fontSize: '16px' }}>Inventory Status</h3></div>
          <div className="card-body">
            <div className="grid grid-3" style={{ marginBottom: '24px' }}>
              <div style={{ background: '#eff6ff', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#1e40af' }}>{dashboard?.inventoryStats?.total}</div>
                <div style={{ color: '#64748b', fontSize: '13px' }}>Total Items</div>
              </div>
              <div style={{ background: '#fef2f2', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#dc2626' }}>{dashboard?.inventoryStats?.lowStock}</div>
                <div style={{ color: '#64748b', fontSize: '13px' }}>Low Stock Items</div>
              </div>
              <div style={{ background: '#f0fdf4', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#16a34a' }}>₹{(dashboard?.inventoryStats?.totalValue/1000).toFixed(1)}K</div>
                <div style={{ color: '#64748b', fontSize: '13px' }}>Total Value</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clients tab */}
      {tab === 'clients' && (
        <div className="card">
          <div className="card-header"><h3 style={{ fontSize: '16px' }}>Client Statistics</h3></div>
          <div className="table-container">
            <table>
              <thead><tr><th>Client</th><th>Company</th><th>Email</th><th>Total Orders</th><th>Total Spent</th><th>Member Since</th></tr></thead>
              <tbody>
                {clientStats.map(c => (
                  <tr key={c._id}>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td>{c.company || '-'}</td>
                    <td style={{ color: '#64748b' }}>{c.email}</td>
                    <td style={{ fontWeight: 600 }}>{c.totalOrders}</td>
                    <td style={{ fontWeight: 700, color: '#1e40af' }}>₹{c.totalSpent?.toLocaleString()}</td>
                    <td style={{ color: '#64748b' }}>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '-'}</td>
                  </tr>
                ))}
                {!clientStats.length && <tr><td colSpan={6}><div className="empty-state"><h3>No client data</h3></div></td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
