import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { authService } from '../../api/authService';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

function RegisterDetailsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const credentials = location.state;

  const [form, setForm] = useState({
    name: '',
    email: '',
    street: '',
    suite: '',
    city: '',
    zipcode: '',
    phone: '',
    companyName: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!credentials || !credentials.username || !credentials.password) {
      navigate('/register', { replace: true });
    }
  }, [credentials, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const validate = () => {
    if (!form.name.trim()) return 'Full name is required.';
    if (!form.email.trim()) return 'Email is required.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'Email is not valid.';
    if (!form.street.trim()) return 'Street is required.';
    if (!form.city.trim()) return 'City is required.';
    if (!form.zipcode.trim()) return 'Zipcode is required.';
    if (!form.phone.trim()) return 'Phone is required.';
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
      const newUser = {
        name: form.name.trim(),
        username: credentials.username,
        email: form.email.trim(),
        website: credentials.password,
        phone: form.phone.trim(),
        address: {
          street: form.street.trim(),
          suite: form.suite.trim(),
          city: form.city.trim(),
          zipcode: form.zipcode.trim(),
          geo: { lat: '0', lng: '0' },
        },
        company: {
          name: form.companyName.trim() || '—',
          catchPhrase: '',
          bs: '',
        },
      };
      const created = await authService.register(newUser);
      login(created);
      navigate('/home', { replace: true });
    } catch {
      setError('Could not create your account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!credentials) return null;

  return (
    <div className="auth-shell">
      <div className="auth-card auth-card-wide">
        <div className="auth-header">
          <span className="auth-mark">◆</span>
          <h1 className="auth-title">Almost there</h1>
          <p className="auth-subtitle">
            Step 2 of 2 — tell us a bit about you
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <Input
            label="Full name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Jane Doe"
            required
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
          />
          <div className="form-row">
            <Input
              label="Street"
              name="street"
              value={form.street}
              onChange={handleChange}
              required
            />
            <Input
              label="Suite (optional)"
              name="suite"
              value={form.suite}
              onChange={handleChange}
            />
          </div>
          <div className="form-row">
            <Input
              label="City"
              name="city"
              value={form.city}
              onChange={handleChange}
              required
            />
            <Input
              label="Zipcode"
              name="zipcode"
              value={form.zipcode}
              onChange={handleChange}
              required
            />
          </div>
          <Input
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
          />
          <Input
            label="Company name (optional)"
            name="companyName"
            value={form.companyName}
            onChange={handleChange}
          />

          {error && <div className="auth-error">{error}</div>}

          <Button type="submit" disabled={submitting} className="auth-submit">
            {submitting ? 'Creating…' : 'Create account'}
          </Button>
        </form>

        <p className="auth-switch">
          Want to start over?{' '}
          <Link to="/register" className="auth-link">
            Back to step 1
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterDetailsPage;
