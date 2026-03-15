import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Admin pages
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminOrders from './pages/admin/Orders';
import AdminInventory from './pages/admin/Inventory';
import AdminProduction from './pages/admin/Production';
import AdminInvoices from './pages/admin/Invoices';
import AdminMessages from './pages/admin/Messages';
import AdminReports from './pages/admin/Reports';
import AdminClients from './pages/admin/Clients';

// Client pages
import ClientLayout from './components/client/ClientLayout';
import ClientDashboard from './pages/client/Dashboard';
import ClientOrders from './pages/client/Orders';
import ClientInvoices from './pages/client/Invoices';
import ClientMessages from './pages/client/Messages';

function PrivateRoute({ children, adminOnly }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-container"><div className="loading-spinner"/></div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/client/dashboard" />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/client/dashboard'} /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/client/dashboard" /> : <Register />} />

      <Route path="/admin" element={<PrivateRoute adminOnly><AdminLayout /></PrivateRoute>}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="inventory" element={<AdminInventory />} />
        <Route path="production" element={<AdminProduction />} />
        <Route path="invoices" element={<AdminInvoices />} />
        <Route path="messages" element={<AdminMessages />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="clients" element={<AdminClients />} />
      </Route>

      <Route path="/client" element={<PrivateRoute><ClientLayout /></PrivateRoute>}>
        <Route path="dashboard" element={<ClientDashboard />} />
        <Route path="orders" element={<ClientOrders />} />
        <Route path="invoices" element={<ClientInvoices />} />
        <Route path="messages" element={<ClientMessages />} />
      </Route>

      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{
          style: { fontFamily: "'DM Sans', sans-serif", fontSize: '14px' },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } }
        }} />
      </BrowserRouter>
    </AuthProvider>
  );
}
