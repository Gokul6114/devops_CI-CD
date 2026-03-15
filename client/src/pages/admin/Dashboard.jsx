import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { ShoppingCart, Package, TrendingUp, Users, AlertTriangle, Clock, CheckCircle, Truck } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([axios.get('/reports/dashboard'), axios.get('/reports/sales')])
      .then(([dashRes, salesRes]) => { setData(dashRes.data); setSales(salesRes.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-container"><div className="loading-spinner"/><p>Loading dashboard...</p></div>;

  const orderPie = data?.orderStats?.map(s => ({ name: s._id, value: s.count })) || [];
  const COLORS = ['#60a5fa', '#34d399', '#a78bfa', '#fb923c', '#f87171'];

  const totalOrders = data?.orderStats?.reduce((s, o) => s + o.count, 0) || 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back! Here's what's happening today.</p>
        </div>
        <span style={{ fontSize: '13px', color: '#64748b' }}>{format(new Date(), 'EEEE, MMMM d, yyyy')}</span>
      </div>

      {/* Stats */}
      <div className="grid grid-4" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-icon"><ShoppingCart size={22}/></div>
          <div className="stat-value">{totalOrders}</div>
          <div className="stat-label">Total Orders</div>
        </div>
        <div className="stat-card" style={{ '--before-color': '#10b981' }}>
          <div className="stat-icon" style={{ background: '#d1fae5', color: '#059669' }}><TrendingUp size={22}/></div>
          <div className="stat-value">₹{(data?.totalRevenue / 1000).toFixed(1)}K</div>
          <div className="stat-label">Total Revenue</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}><Package size={22}/></div>
          <div className="stat-value">{data?.inventoryStats?.total || 0}</div>
          <div className="stat-label">Inventory Items</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}><AlertTriangle size={22}/></div>
          <div className="stat-value">{data?.inventoryStats?.lowStock || 0}</div>
          <div className="stat-label">Low Stock Alerts</div>
        </div>
      </div>

      {/* Order status summary */}
      <div className="grid grid-4" style={{ marginBottom: '24px' }}>
        {[
          { label: 'Pending', count: data?.orderStats?.find(o=>o._id==='Pending')?.count || 0, icon: Clock, color: '#f59e0b', bg: '#fef3c7' },
          { label: 'Processing', count: data?.orderStats?.find(o=>o._id==='Processing')?.count || 0, icon: ShoppingCart, color: '#3b82f6', bg: '#dbeafe' },
          { label: 'Completed', count: data?.orderStats?.find(o=>o._id==='Completed')?.count || 0, icon: CheckCircle, color: '#10b981', bg: '#d1fae5' },
          { label: 'Delivered', count: data?.orderStats?.find(o=>o._id==='Delivered')?.count || 0, icon: Truck, color: '#8b5cf6', bg: '#ede9fe' },
        ].map(({ label, count, icon: Icon, color, bg }) => (
          <div key={label} style={{ background: 'white', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={20} color={color} />
            </div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', fontFamily: 'Outfit, sans-serif' }}>{count}</div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-2" style={{ marginBottom: '24px' }}>
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '16px' }}>Monthly Revenue</h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={sales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => ['₹' + v.toLocaleString(), 'Revenue']} />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '16px' }}>Order Trend</h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={sales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="orders" stroke="#2563eb" strokeWidth={2} dot={{ r: 4, fill: '#2563eb' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Orders + Order Status */}
      <div className="grid grid-2">
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '16px' }}>Recent Orders</h3>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Client</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(data?.recentOrders || []).map(order => (
                  <tr key={order._id}>
                    <td style={{ fontWeight: 600, color: '#2563eb' }}>{order.orderNumber}</td>
                    <td>{order.client?.company || order.client?.name}</td>
                    <td>₹{order.totalAmount?.toLocaleString()}</td>
                    <td><span className={`badge badge-${order.status?.toLowerCase()}`}>{order.status}</span></td>
                  </tr>
                ))}
                {!data?.recentOrders?.length && (
                  <tr><td colSpan={4} style={{ textAlign: 'center', color: '#94a3b8', padding: '30px' }}>No orders yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '16px' }}>Order Distribution</h3>
          </div>
          <div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {orderPie.length ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                <PieChart width={180} height={180}>
                  <Pie data={orderPie} cx={90} cy={90} innerRadius={50} outerRadius={80} dataKey="value">
                    {orderPie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {orderPie.map((item, i) => (
                    <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS[i] }} />
                      <span style={{ color: '#64748b' }}>{item.name}</span>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p style={{ color: '#94a3b8' }}>No data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
