import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, ShoppingCart, FileText, MessageSquare, LogOut, Layers, ChevronRight } from 'lucide-react';

const nav = [
  { to: '/client/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/client/orders', icon: ShoppingCart, label: 'My Orders' },
  { to: '/client/invoices', icon: FileText, label: 'Invoices' },
  { to: '/client/messages', icon: MessageSquare, label: 'Messages' },
];

export default function ClientLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="app-layout">
      <aside style={{
        position: 'fixed', left: 0, top: 0, bottom: 0,
        width: 'var(--sidebar-width)',
        background: 'linear-gradient(180deg, #1e3a8a 0%, #1e40af 100%)',
        display: 'flex', flexDirection: 'column', zIndex: 100,
      }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', background: 'rgba(255,255,255,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={20} color="white" />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>SAI TEXTILE</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>Client Portal</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '11px 14px', borderRadius: '10px',
              color: isActive ? 'white' : 'rgba(255,255,255,0.7)',
              fontSize: '14px', fontWeight: 500, textDecoration: 'none',
              background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
              transition: 'all 0.15s',
            })}>
              <Icon size={18}/>
              <span>{label}</span>
              <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.4 }} />
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px', flexShrink: 0 }}>{user?.name?.[0]}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>Client</div>
          </div>
          <button onClick={handleLogout} style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LogOut size={15}/>
          </button>
        </div>
      </aside>

      <div className="main-content">
        <header style={{ height: 'var(--header-height)', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', padding: '0 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', justifyContent: 'flex-end' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700 }}>{user?.name?.[0]}</div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 500, color: '#334155' }}>{user?.name}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>{user?.company || user?.email}</div>
            </div>
          </div>
        </header>
        <div className="page-container"><Outlet /></div>
      </div>
    </div>
  );
}
