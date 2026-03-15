import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Layers } from 'lucide-react';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/client/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.left}>
        <div style={styles.brand}>
          <div style={styles.logoIcon}><Layers size={32} color="white" /></div>
          <h1 style={styles.brandName}>SAI PATHIRAKALIAMMAN</h1>
          <p style={styles.brandSub}>Textile Process Management</p>
        </div>
        <div style={styles.features}>
          {['Order Management', 'Inventory Tracking', 'Production Monitoring', 'Invoice Generation', 'Client Communication'].map(f => (
            <div key={f} style={styles.featureItem}>
              <div style={styles.featureDot}/>
              <span>{f}</span>
            </div>
          ))}
        </div>
        <div style={styles.tagline}>
          <p>Streamlining textile operations with modern technology</p>
        </div>
      </div>

      <div style={styles.right}>
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Welcome back</h2>
            <p style={styles.formSubtitle}>Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  style={{ paddingRight: '44px' }}
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                  {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
            </div>

            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '8px', padding: '13px' }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={styles.divider}><span>Demo Credentials</span></div>
          <div style={styles.demoBox}>
            <div style={styles.demoItem}>
              <strong>Admin:</strong> admin@textile.com / admin123
            </div>
            <div style={styles.demoItem}>
              <strong>Client:</strong> client@textile.com / client123
            </div>
          </div>

          <p style={styles.registerLink}>
            New client? <Link to="/register" style={{ color: '#2563eb', fontWeight: 600 }}>Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', minHeight: '100vh' },
  left: {
    flex: 1,
    background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '60px',
    color: 'white',
    position: 'relative',
    overflow: 'hidden',
  },
  brand: { marginBottom: '48px' },
  logoIcon: {
    width: '64px', height: '64px',
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '16px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '24px',
    backdropFilter: 'blur(10px)',
  },
  brandName: { fontSize: '26px', fontWeight: 800, color: 'white', letterSpacing: '-0.5px', marginBottom: '8px' },
  brandSub: { fontSize: '16px', color: 'rgba(255,255,255,0.7)', fontWeight: 400 },
  features: { display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '48px' },
  featureItem: { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px', color: 'rgba(255,255,255,0.9)' },
  featureDot: { width: '8px', height: '8px', borderRadius: '50%', background: '#93c5fd', flexShrink: 0 },
  tagline: { padding: '20px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)', borderLeft: '3px solid rgba(255,255,255,0.4)' },
  right: {
    width: '500px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    background: '#f8fafc',
  },
  formCard: {
    width: '100%',
    background: 'white',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    border: '1px solid #e2e8f0',
  },
  formHeader: { marginBottom: '32px' },
  formTitle: { fontSize: '26px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' },
  formSubtitle: { fontSize: '14px', color: '#64748b' },
  eyeBtn: {
    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center',
  },
  divider: {
    textAlign: 'center', margin: '24px 0',
    position: 'relative',
    '&::before': { content: '""', position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: '#e2e8f0' },
  },
  demoBox: {
    background: '#f1f5f9', borderRadius: '10px', padding: '14px 16px',
    display: 'flex', flexDirection: 'column', gap: '6px',
  },
  demoItem: { fontSize: '13px', color: '#475569' },
  registerLink: { textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#64748b' },
};
