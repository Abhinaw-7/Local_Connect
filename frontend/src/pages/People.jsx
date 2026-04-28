import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, MessageCircle, User as UserIcon } from 'lucide-react';
import API from '../api';
import { useAuth } from '../context/AuthContext';

const People = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const fetchUsers = async () => {
    try {
      const { data } = await API.get(`/auth/users?search=${search}`);
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    const aIsLocal = a.location?.pincode && a.location.pincode === currentUser?.location?.pincode;
    const bIsLocal = b.location?.pincode && b.location.pincode === currentUser?.location?.pincode;
    if (aIsLocal && !bIsLocal) return -1;
    if (!aIsLocal && bIsLocal) return 1;
    return 0;
  });

  return (
    <div className="ig-people-page">
      <div className="ig-people-header">
        <h2>Explore Community</h2>
        <div className="ig-search-container">
          <Search className="ig-search-icon" size={16} />
          <input
            type="text"
            placeholder="Search neighbors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="page-loader"><div className="spinner"></div></div>
      ) : sortedUsers.length === 0 ? (
        <div className="empty-state">
          <p>No results found for "{search}"</p>
        </div>
      ) : (
        <div className="ig-user-list">
          {sortedUsers.map((u) => {
            const isLocal = u.location?.pincode && u.location.pincode === currentUser?.location?.pincode;
            return (
              <div key={u._id} className={`ig-user-row ${isLocal ? 'ig-local-neighbor' : ''}`}>
                <Link to={`/user/${u._id}`} className="ig-user-avatar-link">
                  <div className={`ig-avatar-ring ${isLocal ? 'neighbor' : ''}`}>
                    <div className="ig-avatar-small">
                      {u.profilePhoto && u.profilePhoto !== 'no-photo.jpg' ? (
                        <img src={u.profilePhoto} alt="" className="ig-avatar-img" />
                      ) : (
                        u.name?.charAt(0).toUpperCase()
                      )}
                    </div>
                  </div>
                </Link>
                
                <div className="ig-user-info">
                  <Link to={`/user/${u._id}`} className="ig-user-name-stack">
                    <span className="ig-user-username">
                      @{u.username || u.name.toLowerCase().replace(/\s+/g, '_')}
                    </span>
                    <span className="ig-user-fullname">
                      {u.name} {isLocal && <span className="ig-neighbor-tag">• Neighbor</span>}
                    </span>
                  </Link>
                  {u.location?.city && (
                    <span className="ig-user-subtext">
                      <MapPin size={10} /> {u.location.city}
                    </span>
                  )}
                </div>

                <div className="ig-user-actions">
                  <Link 
                    to={`/messages?user=${u._id}&name=${encodeURIComponent(u.name)}&username=${encodeURIComponent(u.username || '')}`} 
                    className="ig-btn-message"
                  >
                    Message
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default People;
