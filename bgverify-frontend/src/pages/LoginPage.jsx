import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield } from 'lucide-react';

const testAccounts = [
  { email: 'admin@bgverify.ai', password: 'AdminPass123!', role: 'Admin', color: '#ef4444' },
  { email: 'hr@acme-corp.com', password: 'HrPass123!', role: 'HR Manager', color: '#f59e0b' },
  { email: 'rahul.sharma@example.com', password: 'CandidatePass123!', role: 'Candidate', color: '#10b981' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      // Redirect based on role
      if (user.role === 'admin') navigate('/admin');
      else if (['org_owner', 'hr_admin', 'hr_executive'].includes(user.role))
        navigate('/company');
      else navigate('/candidate');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillTestAccount = (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
  };

  return (
    <div className="login-page">
      <div className="login-bg-pattern" />
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-icon">
            <Shield size={28} />
          </div>
          <h1>BGVerify<span>.ai</span></h1>
        </div>
        <p className="login-subtitle">
          AI-Powered Background Verification Platform
        </p>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          Don't have an account?{' '}
          <Link to="/register">Create one</Link>
        </div>

        <div className="test-accounts">
          <h4>Quick Login (Demo)</h4>
          {testAccounts.map((acc) => (
            <button
              key={acc.email}
              className="test-account-btn"
              onClick={() => fillTestAccount(acc)}
            >
              <span className="role-dot" style={{ background: acc.color }}></span>
              <span style={{ flex: 1 }}>{acc.role}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                {acc.email}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
