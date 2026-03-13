import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api';
import { Save, MapPin, User, Phone, Mail, Shield } from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    city: '',
    area: '',
    pincode: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await API.get('/auth/me');
        setForm({
          name: data.name || '',
          phone: data.phone || '',
          city: data.location?.city || '',
          area: data.location?.area || '',
          pincode: data.location?.pincode || '',
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        location: {
          city: form.city,
          area: form.area,
          pincode: form.pincode,
        },
      };
      const { data } = await API.put('/auth/profile', payload);
      updateUser(data);
      setMessage('Profile updated successfully!');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="page-loader"><div className="spinner"></div></div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar-large">
            {user?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <h2>{user?.name}</h2>
            <p className="profile-email"><Mail size={14} /> {user?.email}</p>
            <p className="profile-role"><Shield size={14} /> {user?.role}</p>
          </div>
        </div>

        {message && (
          <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-section">
            <h3><User size={18} /> Personal Info</h3>
            <div className="input-group">
              <input
                type="text"
                placeholder="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="input-group">
              <Phone size={18} className="input-icon" />
              <input
                type="tel"
                placeholder="Phone Number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="form-section">
            <h3><MapPin size={18} /> Location</h3>
            <div className="form-row">
              <div className="input-group">
                <input
                  type="text"
                  placeholder="City"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Area"
                  value={form.area}
                  onChange={(e) => setForm({ ...form, area: e.target.value })}
                />
              </div>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Pincode"
                  value={form.pincode}
                  onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                />
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={saving}>
            {saving ? <span className="spinner-small"></span> : <><Save size={18} /> Save Changes</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
