import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Shield,
  Users,
  Briefcase,
  FileSearch,
  Wallet,
  Building2,
  ScrollText,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  Search,
  Globe,
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const navItems = {
  admin: [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/admin/verifications', icon: FileSearch, label: 'Verifications' },
    { to: '/admin/review', icon: Shield, label: 'Review Queue' },
    { to: '/admin/portals', icon: Globe, label: 'Verify Portals' },
    { to: '/admin/organizations', icon: Building2, label: 'Company Accounts' },
    { to: '/admin/audit', icon: ScrollText, label: 'Audit & Security' },
  ],
  company: [
    { to: '/company', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/company/roles', icon: Briefcase, label: 'Roles & Sectors' },
    { to: '/company/candidates', icon: Users, label: 'Candidates' },
    { to: '/company/verifications', icon: FileSearch, label: 'Verifications' },
    { to: '/company/review', icon: Shield, label: 'Review Queue' },
    { to: '/company/portals', icon: Globe, label: 'Verify Portals' },
    { to: '/company/wallet', icon: Wallet, label: 'Wallet & BGCoins' },
  ],
  candidate: [
    { to: '/candidate', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/candidate/tasks', icon: FileSearch, label: 'My Tasks & Uploads' },
    { to: '/candidate/documents', icon: ScrollText, label: 'Documents' },
  ],
};

export default function DashboardLayout() {
  const { user, logout, isAdmin, isCompany, isCandidate } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const role = isAdmin ? 'admin' : isCompany ? 'company' : 'candidate';
  const items = navItems[role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = () => {
    if (isAdmin) return { text: 'Platform Admin', color: 'bg-red-500/20 text-red-300' };
    if (isCompany) return { text: 'HR Manager', color: 'bg-amber-500/20 text-amber-300' };
    return { text: 'Candidate', color: 'bg-emerald-500/20 text-emerald-300' };
  };

  const badge = getRoleBadge();

  return (
    <div className="dashboard-layout">
      {/* Sidebar Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">
              <Shield size={24} />
            </div>
            <div>
              <h1 className="logo-text">BGVerify</h1>
              <span className="logo-sub">.ai</span>
            </div>
          </div>
          <button
            className="sidebar-close-btn"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'nav-link-active' : ''}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user-info">
            <div className="user-avatar">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="user-meta">
              <p className="user-name">{user?.firstName} {user?.lastName}</p>
              <span className={`role-badge ${badge.color}`}>{badge.text}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-wrapper">
        {/* Top Header */}
        <header className="top-header">
          <div className="header-left">
            <button
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>
            <div className="search-bar">
              <Search size={18} />
              <input type="text" placeholder="Search verifications, candidates..." />
            </div>
          </div>
          <div className="header-right">
            <ThemeToggle />
            <button className="notification-btn">
              <Bell size={20} />
              <span className="notification-dot"></span>
            </button>
            <div className="profile-dropdown-wrapper">
              <button
                className="profile-trigger"
                onClick={() => setProfileOpen(!profileOpen)}
              >
                <div className="user-avatar-sm">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <ChevronDown size={16} />
              </button>
              {profileOpen && (
                <div className="profile-dropdown">
                  <div className="dropdown-header">
                    <p className="dropdown-name">{user?.firstName} {user?.lastName}</p>
                    <p className="dropdown-email">{user?.email}</p>
                  </div>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item" onClick={handleLogout}>
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
