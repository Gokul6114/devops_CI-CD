import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, ShoppingCart, Package, Factory, FileText,
  MessageSquare, BarChart2, Users, LogOut, Layers, ChevronRight, Bell, Menu, X
} from 'lucide-react';

const nav = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
  { to: '/admin/inventory', icon: Package, label: 'Inventory' },
  { to: '/admin/production', icon: Factory, label: 'Production' },
  { to: '/admin/invoices', icon: FileText, label: 'Invoices' },
  { to: '/admin/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/admin/reports', icon: BarChart2, label: 'Reports' },
  { to: '/admin/clients', icon: Users, label: 'Clients' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      {mobileOpen && <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }} />}

      {/* Sidebar */}
      <aside style={{
        ...styles.sidebar,
        transform: mobileOpen ? 'translateX(0)' : undefined,
      }}>
        <div style={styles.sidebarHeader}>
          <div style={styles.logoWrap}>
            <div style={styles.logoIcon}><Layers size={20} color="white" /></div>
            <div>
              <div style={styles.logoTitle}>SAI TEXTILE</div>
              <div style={styles.logoSub}>Management System</div>
            </div>
          </div>
        </div>

        <nav style={styles.nav}>
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to} to={to}
              onClick={() => setMobileOpen(false)}
              style={({ isActive }) => ({ ...styles.navItem, ...(isActive ? styles.navItemActive : {}) })}
            >
              <Icon size={18} />
              <span>{label}</span>
              <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.4 }} />
            </NavLink>
          ))}
        </nav>

        <div style={styles.sidebarFooter}>
          <div style={styles.userInfo}>
            <div style={styles.userAvatar}>{user?.name?.[0]?.toUpperCase()}</div>
            <div style={styles.userDetails}>
              <div style={styles.userName}>{user?.name}</div>
              <div style={styles.userRole}>Administrator</div>
            </div>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="main-content">
        <header style={styles.header}>
          <button onClick={() => setMobileOpen(!mobileOpen)} style={styles.menuBtn}>
            {mobileOpen ? <X size={20}/> : <Menu size={20}/>}
          </button>
          <div style={styles.headerRight}>
            <button style={styles.notifBtn}><Bell size={18} /></button>
            <div style={styles.headerUser}>
              <div style={styles.userAvatarSm}>{user?.name?.[0]?.toUpperCase()}</div>
              <span style={{ fontSize: '14px', fontWeight: 500, color: '#334155' }}>{user?.name}</span>
            </div>
          </div>
        </header>
        <div className="page-container">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

const styles = {
  sidebar: {
    position: 'fixed', left: 0, top: 0, bottom: 0,
    width: 'var(--sidebar-width)',
    background: 'linear-gradient(180deg, #1e3a8a 0%, #1e40af 100%)',
    display: 'flex', flexDirection: 'column',
    zIndex: 100, overflowY: 'auto',
    transition: 'transform 0.3s ease',
  },
  sidebarHeader: {
    padding: '24px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  logoWrap: { display: 'flex', alignItems: 'center', gap: '12px' },
  logoIcon: {
    width: '38px', height: '38px',
    background: 'rgba(255,255,255,0.2)', borderRadius: '10px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  logoTitle: { fontSize: '14px', fontWeight: 700, color: 'white', letterSpacing: '0.5px' },
  logoSub: { fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginTop: '1px' },
  nav: { flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' },
  navItem: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '11px 14px', borderRadius: '10px',
    color: 'rgba(255,255,255,0.7)', fontSize: '14px', fontWeight: 500,
    textDecoration: 'none', transition: 'all 0.15s',
  },
  navItemActive: {
    background: 'rgba(255,255,255,0.15)', color: 'white',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  },
  sidebarFooter: {
    padding: '16px 16px 20px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    display: 'flex', alignItems: 'center', gap: '12px',
  },
  userInfo: { display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 },
  userAvatar: {
    width: '36px', height: '36px', borderRadius: '50%',
    background: 'rgba(255,255,255,0.2)', color: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '14px', fontWeight: 700, flexShrink: 0,
  },
  userDetails: { minWidth: 0 },
  userName: { fontSize: '13px', fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  userRole: { fontSize: '11px', color: 'rgba(255,255,255,0.6)' },
  logoutBtn: {
    width: '32px', height: '32px', background: 'rgba(255,255,255,0.1)',
    border: 'none', borderRadius: '8px', cursor: 'pointer',
    color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  header: {
    height: 'var(--header-height)', background: 'white',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 24px', position: 'sticky', top: 0, zIndex: 50,
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  headerRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  menuBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'none', '@media (max-width: 768px)': { display: 'flex' } },
  notifBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', padding: '6px' },
  headerUser: { display: 'flex', alignItems: 'center', gap: '8px' },
  userAvatarSm: {
    width: '32px', height: '32px', borderRadius: '50%',
    background: '#2563eb', color: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '13px', fontWeight: 700,
  },
};
