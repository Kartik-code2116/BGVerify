import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('bgverify_token'));

  useEffect(() => {
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      const res = await authAPI.getProfile();
      setUser(res.data.data.user);
    } catch (err) {
      console.error('Failed to load user:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { user: userData, token: accessToken, refreshToken } = res.data.data;
    localStorage.setItem('bgverify_token', accessToken);
    localStorage.setItem('bgverify_refresh', refreshToken);
    localStorage.setItem('bgverify_user', JSON.stringify(userData));
    setToken(accessToken);
    setUser(userData);
    return userData;
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    const { user: userData, token: accessToken, refreshToken } = res.data.data;
    localStorage.setItem('bgverify_token', accessToken);
    localStorage.setItem('bgverify_refresh', refreshToken);
    localStorage.setItem('bgverify_user', JSON.stringify(userData));
    setToken(accessToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('bgverify_token');
    localStorage.removeItem('bgverify_refresh');
    localStorage.removeItem('bgverify_user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isCompany: ['org_owner', 'hr_admin', 'hr_executive'].includes(user?.role),
    isCandidate: user?.role === 'candidate',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
