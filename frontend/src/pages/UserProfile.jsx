import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Mail, Phone, MessageCircle, Calendar, Shield, ArrowLeft } from 'lucide-react';
import API from '../api';
import { useAuth } from '../context/AuthContext';

const UserProfile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await API.get(`/auth/users/${id}`);
        setProfile(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  if (loading) {
    return <div className="page-loader"><div className="spinner"></div></div>;
  }

  if (!profile) {
    return (
      <div className="empty-state">
        <p>User not found.</p>
        <Link to="/people" className="btn btn-primary" style={{ marginTop: '16px', display: 'inline-flex' }}>
          Back to Community
        </Link>
      </div>
    );
  }

  const isOwnProfile = currentUser?._id === profile._id;
  const joinDate = new Date(profile.createdAt).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="user-profile-page">
      <button className="back-link" onClick={() => navigate(-1)}>
        <ArrowLeft size={18} /> Back
      </button>

      <div className="user-profile-card">
        <div className="user-profile-header">
          <div className="user-profile-avatar">
            {profile.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="user-profile-details">
            <h2>{profile.name}</h2>
            <div className="user-profile-meta">
              <span><Mail size={14} /> {profile.email}</span>
              {profile.phone && <span><Phone size={14} /> {profile.phone}</span>}
              {profile.location?.city && (
                <span>
                  <MapPin size={14} />{' '}
                  {profile.location.area ? `${profile.location.area}, ` : ''}
                  {profile.location.city}
                  {profile.location.pincode ? ` - ${profile.location.pincode}` : ''}
                </span>
              )}
              <span><Shield size={14} /> {profile.role}</span>
              <span><Calendar size={14} /> Joined {joinDate}</span>
            </div>
          </div>
        </div>

        {!isOwnProfile && (
          <div className="user-profile-actions">
            <Link
              to={`/messages?user=${profile._id}&name=${encodeURIComponent(profile.name)}`}
              className="btn btn-primary"
            >
              <MessageCircle size={18} /> Send Message
            </Link>
          </div>
        )}

        {isOwnProfile && (
          <div className="user-profile-actions">
            <Link to="/profile" className="btn btn-secondary">
              Edit Your Profile
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
