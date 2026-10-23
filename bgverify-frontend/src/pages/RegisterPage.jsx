import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export default function RegisterPage() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '',
    role: 'org_owner', organizationName: '', phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register(form);
      if (user.role === 'admin') navigate('/admin');
      else if (['org_owner', 'hr_admin', 'hr_executive'].includes(user.role))
        navigate('/company');
      else navigate('/candidate');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page auth-page auth-shell">
      <div className="login-bg-pattern" />
      <div className="auth-theme-toggle"><ThemeToggle /></div>
      <aside className="auth-story">
        <Link className="brand auth-story-brand" to="/"><span className="brand-mark"><Shield size={20}/></span><span>bgverify<span className="brand-dot">.</span></span></Link>
        <div className="auth-story-content"><span className="auth-story-kicker">A CLEARER WAY TO VERIFY</span><h2>Start with trust. Build from there.</h2><p>One considered workspace for verification requests, candidate tasks and responsible review.</p><div className="auth-illustration"><div className="auth-orbit auth-orbit-a"/><div className="auth-orbit auth-orbit-b"/><div className="auth-float-card"><span className="auth-float-icon"><Shield size={20}/></span><span><strong>One step at a time</strong><small>Simple, transparent workflows</small></span><span className="auth-float-check">✓</span></div><div className="auth-float-dot">✓</div></div><div className="auth-story-foot"><span><Shield size={14}/> Private by design</span><span>People first, at every step</span></div></div>
      </aside>
      <div className="login-card" style={{ maxWidth: '480px' }}>
        <Link className="login-logo" to="/">
          <div className="logo-icon"><Shield size={28} /></div>
          <h1>BGVerify<span>.ai</span></h1>
        </Link>
        <p className="login-subtitle">Create your account</p>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input className="form-input" name="firstName" placeholder="First Name"
                value={form.firstName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input className="form-input" name="lastName" placeholder="Last Name"
                value={form.lastName} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-input" name="email"
              placeholder="you@company.com" value={form.email}
              onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-input" name="password"
              placeholder="Min 8 chars, 1 uppercase, 1 number"
              value={form.password} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">I am registering as</label>
            <select className="form-select" name="role"
              value={form.role} onChange={handleChange}>
              <option value="org_owner">Company / HR Team</option>
              <option value="candidate">Candidate</option>
            </select>
          </div>
          {form.role === 'org_owner' && (
            <div className="form-group">
              <label className="form-label">Organization Name</label>
              <input className="form-input" name="organizationName"
                placeholder="e.g., Acme Corp" value={form.organizationName}
                onChange={handleChange} required />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Phone (Optional)</label>
            <input className="form-input" name="phone" placeholder="+91-XXXXXXXXXX"
              value={form.phone} onChange={handleChange} />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <div className="login-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
