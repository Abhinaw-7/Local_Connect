import { useState } from 'react';
import { MapPin, X, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api';

const LocationBanner = () => {
  const { user, updateUser } = useAuth();
  const [show, setShow] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ city: '', area: '', pincode: '' });
  const [saving, setSaving] = useState(false);

  const hasLocation = user?.location?.pincode || user?.location?.city;

  if (!show || hasLocation) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.pincode && !form.city) return;
    setSaving(true);
    try {
      const { data } = await API.put('/auth/profile', {
        location: { city: form.city, area: form.area, pincode: form.pincode },
      });
      updateUser(data);
      setEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="location-banner">
      <div className="location-banner-content">
        <MapPin size={20} />
        <div>
          <strong>Set your location</strong>
          <p>Add your pincode to see posts from your local community first!</p>
        </div>
        <div className="location-banner-actions">
          {!editing ? (
            <>
              <button className="btn btn-primary btn-small" onClick={() => setEditing(true)}>
                Set Location
              </button>
              <button className="btn-icon-close" onClick={() => setShow(false)}>
                <X size={16} />
              </button>
            </>
          ) : (
            <form className="location-inline-form" onSubmit={handleSave}>
              <input
                type="text"
                placeholder="Pincode *"
                value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="City"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
              <input
                type="text"
                placeholder="Area"
                value={form.area}
                onChange={(e) => setForm({ ...form, area: e.target.value })}
              />
              <button type="submit" className="btn btn-primary btn-small" disabled={saving}>
                {saving ? <span className="spinner-small"></span> : <><Save size={14} /> Save</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationBanner;
