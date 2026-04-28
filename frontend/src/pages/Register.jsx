import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, MapPin, AtSign, Check, X, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api';

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    location: { city: '', pincode: '' },
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState({ loading: false, available: null });
  const { register } = useAuth();
  const navigate = useNavigate();

  // Username availability check logic
  useEffect(() => {
    if (!form.username || form.username.length < 3) {
      setUsernameStatus({ loading: false, available: null });
      return;
    }

    const timer = setTimeout(async () => {
      setUsernameStatus({ loading: true, available: null });
      try {
        const { data } = await API.get(`/auth/check-username/${form.username}`);
        setUsernameStatus({ loading: false, available: data.available });
      } catch (err) {
        setUsernameStatus({ loading: false, available: null });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [form.username]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'city' || name === 'pincode') {
      setForm({ ...form, location: { ...form.location, [name]: value } });
    } else if (name === 'username') {
      // Basic cleaning for username
      const cleanVal = value.toLowerCase().replace(/[^a-z0-9._]/g, '');
      setForm({ ...form, [name]: cleanVal });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (usernameStatus.available === false) {
      setError('Username is already taken');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.location, form.username);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo"><MapPin size={32} /></div>
          <h1>Create Account</h1>
          <p>Join your local neighborhood community</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <User className="input-icon" size={18} />
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <AtSign className="input-icon" size={18} />
            <input
              type="text"
              name="username"
              placeholder="Unique Username (e.g. abhinav_12)"
              value={form.username}
              onChange={handleChange}
              required
            />
            <div className="username-indicator">
              {usernameStatus.loading ? (
                <Loader2 size={14} className="animate-spin text-muted" />
              ) : usernameStatus.available === true ? (
                <Check size={16} className="text-success" />
              ) : usernameStatus.available === false ? (
                <X size={16} className="text-danger" />
              ) : null}
            </div>
          </div>

          <div className="input-group">
            <Mail className="input-icon" size={18} />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <Lock className="input-icon" size={18} />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="input-group">
              <MapPin className="input-icon" size={18} />
              <input
                type="text"
                name="city"
                placeholder="City"
                value={form.location.city}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <input
                type="text"
                name="pincode"
                placeholder="Pincode"
                value={form.location.pincode}
                onChange={handleChange}
                required
                style={{ paddingLeft: '16px' }}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading || usernameStatus.available === false}>
            {loading ? <span className="spinner-small"></span> : 'Register'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
