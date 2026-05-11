import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../api/authService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    password: '',
    passwordVerify: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const validate = () => {
    if (!form.username.trim()) return 'Username is required.';
    if (form.username.length < 3) return 'Username must be at least 3 characters.';
    if (!form.password) return 'Password is required.';
    if (form.password.length < 4) return 'Password must be at least 4 characters.';
    if (form.password !== form.passwordVerify) return 'Passwords do not match.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setSubmitting(true);
    try {
      const exists = await authService.usernameExists(form.username.trim());
      if (exists) {
        setError('This username is already taken.');
        return;
      }
      // Username is free — move on to the additional details screen.
      navigate('/register/details', {
        state: {
          username: form.username.trim(),
          password: form.password,
        },
      });
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
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">Step 1 of 2 — choose your credentials</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <Input
            label="Username"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Pick a unique username"
            required
          />
          <Input
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="At least 4 characters"
            required
          />
          <Input
            label="Verify password"
            name="passwordVerify"
            type="password"
            value={form.passwordVerify}
            onChange={handleChange}
            placeholder="Re-enter your password"
            required
          />

          {error && <div className="auth-error">{error}</div>}

          <Button type="submit" disabled={submitting} className="auth-submit">
            {submitting ? 'Checking…' : 'Continue →'}
          </Button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
