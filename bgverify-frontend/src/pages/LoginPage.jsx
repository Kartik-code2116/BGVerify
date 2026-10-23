import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BriefcaseBusiness, Shield, Users } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const testAccounts = [
  { email: 'admin@bgverify.ai', password: 'AdminPass123!', role: 'Admin', color: '#ef4444' },
  { email: 'hr@acme-corp.com', password: 'HrPass123!', role: 'HR Manager', color: '#f59e0b' },
  { email: 'rahul.sharma@example.com', password: 'CandidatePass123!', role: 'Candidate', color: '#10b981' },
];

export default function LoginPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedRole = searchParams.get('role') || 'company';
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
    <div className="login-page auth-page auth-shell">
      <div className="login-bg-pattern" />
      <div className="auth-theme-toggle"><ThemeToggle /></div>
      <aside className="auth-story">
        <Link className="brand auth-story-brand" to="/"><span className="brand-mark"><Shield size={20}/></span><span>bgverify<span className="brand-dot">.</span></span></Link>
        <div className="auth-story-content"><span className="auth-story-kicker">A CLEARER WAY TO VERIFY</span><h2>Every check has a person behind it.</h2><p>A thoughtful space for HR teams to review progress and for candidates to know what comes next.</p><div className="auth-illustration"><div className="auth-orbit auth-orbit-a"/><div className="auth-orbit auth-orbit-b"/><div className="auth-float-card"><span className="auth-float-icon"><Shield size={20}/></span><span><strong>Verification in progress</strong><small>Evidence ready for review</small></span><span className="auth-float-check">✓</span></div><div className="auth-float-dot">✓</div></div><div className="auth-story-foot"><span><Shield size={14}/> Private by design</span><span>People first, at every step</span></div></div>
      </aside>
      <div className="login-card">
        <Link className="login-logo" to="/">
          <div className="logo-icon">
            <Shield size={28} />
          </div>
          <h1>BGVerify<span>.ai</span></h1>
        </Link>
        <p className="login-subtitle">
          Sign in to your BGVerify workspace
        </p>

        <div className="login-role-picker" aria-label="Choose your portal">
          {[{id:'company',name:'HR team',icon:BriefcaseBusiness},{id:'candidate',name:'Candidate',icon:Users},{id:'admin',name:'Admin',icon:Shield}].map(({id,name,icon:Icon})=><button type="button" key={id} className={selectedRole===id?'selected':''} onClick={()=>setSearchParams({role:id})}><Icon size={15}/><span>{name}</span></button>)}
        </div>

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
          New to BGVerify?{' '}
          <Link to="/register">Create one</Link>
        </div>

        <div className="test-accounts">
          <h4>Demo accounts · select to fill in</h4>
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
