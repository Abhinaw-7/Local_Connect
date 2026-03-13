import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Users, MapPin, MessageCircle, Navigation } from 'lucide-react';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import LocationBanner from '../components/LocationBanner';

const People = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      const { data } = await API.get('/auth/users', { params });
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const isLocalUser = (u) => {
    if (!user?.location?.pincode) return false;
    return u.location?.pincode === user.location.pincode;
  };

  const isSameCity = (u) => {
    if (!user?.location?.city) return false;
    return u.location?.city === user.location.city && !isLocalUser(u);
  };

  return (
    <div className="people-page">
      <LocationBanner />

      <div className="page-header">
        <div>
          <h2><Users size={24} /> Community</h2>
          {user?.location?.city && (
            <p className="page-subtitle">
              <MapPin size={14} /> Local people shown first
            </p>
          )}
        </div>
      </div>

      <form className="search-bar" onSubmit={handleSearch}>
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Search by name, city, area, or pincode..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">Search</button>
      </form>

      {loading ? (
        <div className="page-loader"><div className="spinner"></div></div>
      ) : users.length === 0 ? (
        <div className="empty-state"><p>No users found.</p></div>
      ) : (
        <div className="people-grid">
          {users.map((u) => (
            <div key={u._id} className={`person-card ${isLocalUser(u) ? 'person-local' : isSameCity(u) ? 'person-city' : ''}`}>
              {isLocalUser(u) && (
                <span className="local-badge"><Navigation size={11} /> Neighbor</span>
              )}
              {isSameCity(u) && (
                <span className="city-badge"><MapPin size={11} /> Same City</span>
              )}
              <div className="person-avatar">
                {u.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="person-info">
                <h3>{u.name}</h3>
                {u.location?.city && (
                  <p className="person-location">
                    <MapPin size={13} /> {u.location.area ? `${u.location.area}, ` : ''}{u.location.city}
                    {u.location.pincode ? ` - ${u.location.pincode}` : ''}
                  </p>
                )}
                <p className="person-email">{u.email}</p>
              </div>
              <div className="person-actions">
                <Link to={`/user/${u._id}`} className="btn btn-secondary btn-small">
                  View Profile
                </Link>
                <Link to={`/messages?user=${u._id}&name=${encodeURIComponent(u.name)}`} className="btn btn-primary btn-small">
                  <MessageCircle size={14} /> Message
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default People;
