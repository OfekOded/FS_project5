import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../api/authService';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) navigate('/home', { replace: true });
  }, [user, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password.trim()) {
      setError('Both fields are required.');
      return;
    }
    setSubmitting(true);
    try {
      const matched = await authService.login(
        form.username.trim(),
        form.password.trim()
      );
      if (!matched) {
        setError('Invalid username or password.');
        return;
      }
      login(matched);
      navigate('/home', { replace: true });
    } catch {
      setError('Server error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-mark">◆</span>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to continue to your workspace</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <Input
            label="Username"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="e.g. Bret"
            required
            autoComplete="username"
          />
          <Input
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="your website"
            required
            autoComplete="current-password"
          />

          {error && <div className="auth-error">{error}</div>}

          <Button type="submit" disabled={submitting} className="auth-submit">
            {submitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <p className="auth-switch">
          Don't have an account?{' '}
          <Link to="/register" className="auth-link">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
