import { useState, useEffect } from 'react';
import { 
  User, Mail, MapPin, Camera, Save, LogOut, Grid3X3, Heart, MessageCircle, 
  Settings, AtSign, Shield, FileText, X, Clock, ChevronLeft, ChevronRight, Send
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api';
import ImageUpload from '../components/ImageUpload';

const typeColors = {
  help: '#ef4444',
  announcement: '#f59e0b',
  event: '#8b5cf6',
  question: '#3b82f6',
  general: '#6366f1',
};

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'just now';
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

/* ─── Post Modal (Instagram Style) ─── */
const PostModal = ({ post, user, onClose, onPrev, onNext, hasPrev, hasNext }) => {
  const [likes, setLikes] = useState(post.likes || []);
  const [comments, setComments] = useState(post.comments || []);
  const [commentText, setCommentText] = useState('');
  const [liking, setLiking] = useState(false);
  const [commenting, setCommenting] = useState(false);

  const isLiked = likes.includes(user?._id);

  useEffect(() => {
    setLikes(post.likes || []);
    setComments(post.comments || []);
    setCommentText('');
  }, [post._id]);

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleLike = async () => {
    if (liking || !user) return;
    setLiking(true);
    setLikes((prev) =>
      prev.includes(user._id)
        ? prev.filter((id) => id !== user._id)
        : [...prev, user._id]
    );
    try {
      const { data } = await API.put(`/posts/${post._id}/like`);
      setLikes(data);
    } catch (err) {
      console.error(err);
      setLikes(post.likes || []);
    } finally {
      setLiking(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || commenting || !user) return;
    setCommenting(true);
    try {
      const { data } = await API.post(`/posts/${post._id}/comments`, { text: commentText });
      setComments(data);
      setCommentText('');
    } catch (err) {
      console.error(err);
    } finally {
      setCommenting(false);
    }
  };

  if (!post) return null;

  return (
    <div className="ig-modal-backdrop" onClick={handleBackdrop}>
      {hasPrev && (
        <button className="ig-modal-arrow ig-modal-arrow--left" onClick={onPrev}>
          <ChevronLeft size={28} />
        </button>
      )}
      {hasNext && (
        <button className="ig-modal-arrow ig-modal-arrow--right" onClick={onNext}>
          <ChevronRight size={28} />
        </button>
      )}

      <div className="ig-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="ig-modal-left">
          {post.images && post.images.length > 0 ? (
            <img src={post.images[0]} alt="Post" className="ig-modal-main-img" />
          ) : (
            <div className="ig-modal-no-image">
              <span className="ig-modal-type-badge" style={{ background: typeColors[post.type] || typeColors.general }}>
                {post.type}
              </span>
              <p className="ig-modal-content-preview">{post.content}</p>
            </div>
          )}
        </div>

        <div className="ig-modal-right">
          <div className="ig-modal-header">
            <div className="ig-modal-author">
              <div className="ig-modal-avatar">
                {user?.profilePhoto && user.profilePhoto !== 'no-photo.jpg' ? (
                  <img src={user.profilePhoto} alt="" className="ig-avatar-img" />
                ) : (
                  user?.name?.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <span className="ig-modal-author-name">
                   {user?.username ? `@${user.username}` : user?.name}
                </span>
                {post.location?.city && (
                  <span className="ig-modal-location">
                    <MapPin size={11} /> {post.location.city}
                  </span>
                )}
              </div>
            </div>
            <button className="ig-modal-close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <div className="ig-modal-meta">
            <span className="ig-modal-type-pill" style={{ background: typeColors[post.type] || typeColors.general }}>
              {post.type}
            </span>
            <span className="ig-modal-time">
              <Clock size={12} /> {timeAgo(post.createdAt)}
            </span>
          </div>

          <div className="ig-modal-body">
            <p className="ig-modal-text">{post.content}</p>
            {post.images && post.images.length > 1 && (
              <div className="ig-modal-extra-images">
                {post.images.slice(1).map((img, i) => (
                  <img key={i} src={img} alt="Post" className="ig-modal-extra-img" />
                ))}
              </div>
            )}
            {comments.length > 0 && (
              <div className="ig-modal-comments-inline">
                <div className="ig-modal-comments-divider" />
                {comments.map((c, i) => (
                  <div key={i} className="ig-modal-comment">
                    <div className="ig-modal-comment-avatar">
                      {c.user?.profilePhoto && c.user.profilePhoto !== 'no-photo.jpg' ? (
                        <img src={c.user.profilePhoto} alt="" className="ig-avatar-img" />
                      ) : (
                        (c.user?.name || 'U').charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="ig-modal-comment-body">
                      <span className="ig-modal-comment-author">
                        {c.user?.username ? `@${c.user.username}` : c.user?.name || 'User'}
                      </span>
                      <span className="ig-modal-comment-text">{c.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="ig-modal-stats">
            <button className={`ig-modal-like-btn ${isLiked ? 'liked' : ''}`} onClick={handleLike} disabled={liking}>
              <Heart size={22} fill={isLiked ? 'var(--accent)' : 'none'} color={isLiked ? 'var(--accent)' : 'currentColor'} />
            </button>
            <span className="ig-modal-stat">
              <strong>{likes.length}</strong> {likes.length === 1 ? 'like' : 'likes'}
            </span>
            <span className="ig-modal-stat" style={{ marginLeft: 'auto' }}>
              <MessageCircle size={16} color="var(--primary-light)" />
              <strong>{comments.length}</strong>
            </span>
          </div>

          <form className="ig-modal-comment-form" onSubmit={handleComment}>
            <input
              type="text"
              className="ig-modal-comment-input"
              placeholder="Add a comment…"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              maxLength={300}
            />
            <button type="submit" className="ig-modal-comment-send" disabled={!commentText.trim() || commenting}>
              {commenting ? <span className="spinner-small" /> : <Send size={16} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const Profile = () => {
  const { user, logout, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    bio: user?.bio || '',
    profilePhoto: user?.profilePhoto || '',
    location: {
      city: user?.location?.city || '',
      area: user?.location?.area || '',
      pincode: user?.location?.pincode || '',
    }
  });
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [modalIndex, setModalIndex] = useState(null);

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const { data } = await API.get(`/posts/user/${user._id}`);
        setPosts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPosts(false);
      }
    };
    if (user?._id) fetchUserPosts();
  }, [user?._id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (['city', 'area', 'pincode'].includes(name)) {
      setFormData({ ...formData, location: { ...formData.location, [name]: value } });
    } else if (name === 'username') {
      setFormData({ ...formData, [name]: value.toLowerCase().replace(/[^a-z0-9._]/g, '') });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const { data } = await API.put('/auth/profile', formData);
      updateProfile(data);
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const totalLikes = posts.reduce((s, p) => s + (p.likes?.length || 0), 0);
  const totalComments = posts.reduce((s, p) => s + (p.comments?.length || 0), 0);

  return (
    <div className="ig-profile-page">
      {/* ── Modal ── */}
      {modalIndex !== null && (
        <PostModal
          post={posts[modalIndex]}
          user={user}
          onClose={() => setModalIndex(null)}
          onPrev={() => setModalIndex((i) => Math.max(0, i - 1))}
          onNext={() => setModalIndex((i) => Math.min(posts.length - 1, i + 1))}
          hasPrev={modalIndex > 0}
          hasNext={modalIndex < posts.length - 1}
        />
      )}

      {/* ── Header Section ── */}
      <div className="ig-cover-section">
        <div className="ig-cover-bg">
          <div className="ig-cover-gradient" />
        </div>
        <div className="ig-profile-identity">
          <div className="ig-avatar-wrapper">
            <div className="ig-avatar-ring">
              <div className="ig-avatar-inner">
                {user?.profilePhoto && user.profilePhoto !== 'no-photo.jpg' ? (
                  <img src={user.profilePhoto} alt="Avatar" className="ig-avatar-img" />
                ) : (
                  user?.name?.charAt(0)?.toUpperCase() || '?'
                )}
              </div>
            </div>
          </div>
          <div className="ig-profile-info">
            <h1 className="ig-username">{user?.name}</h1>
            <p className="ig-user-handle">
              {user?.username ? (
                <span className="ig-handle-text">@{user.username}</span>
              ) : (
                <span className="ig-handle-text ig-handle-missing" onClick={() => setEditing(true)}>Set a username</span>
              )}
            </p>
            {user?.location?.city && (
              <p className="ig-user-location">
                <MapPin size={13} />
                {user.location.area ? `${user.location.area}, ` : ''}{user.location.city}
              </p>
            )}
            <span className={`ig-role-badge ${user?.role === 'admin' ? 'admin' : ''}`}>
              <Shield size={11} /> {user?.role || 'user'}
            </span>
            {user?.bio && <p className="ig-bio">{user.bio}</p>}
          </div>
          <div className="ig-profile-actions">
            {!editing ? (
              <button className="btn btn-secondary ig-edit-profile-btn" onClick={() => setEditing(true)}>
                <Settings size={16} /> Edit Profile
              </button>
            ) : (
              <button className="btn btn-danger ig-edit-profile-btn" onClick={() => setEditing(false)}>
                Cancel
              </button>
            )}
            <button className="btn btn-danger btn-icon" onClick={logout} title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats Bar ── */}
      <div className="ig-stats-bar">
        <div className="ig-stat">
          <span className="ig-stat-value">{posts.length}</span>
          <span className="ig-stat-label">Posts</span>
        </div>
        <div className="ig-stat-divider" />
        <div className="ig-stat">
          <span className="ig-stat-value">{totalLikes}</span>
          <span className="ig-stat-label">Likes</span>
        </div>
        <div className="ig-stat-divider" />
        <div className="ig-stat">
          <span className="ig-stat-value">{totalComments}</span>
          <span className="ig-stat-label">Comments</span>
        </div>
      </div>

      {/* ── Edit Form ── */}
      {editing && (
        <form className="ig-edit-card premium-card" onSubmit={handleUpdate}>
          <h3>Update Profile</h3>
          {error && <div className="alert alert-error">{error}</div>}
          
          <div className="ig-form-grid">
            <div className="input-group">
              <User className="input-icon" size={16} />
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" required />
            </div>
            
            <div className="input-group">
              <AtSign className="input-icon" size={16} />
              <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Username" required />
            </div>

            <div className="input-group" style={{ gridColumn: 'span 2' }}>
              <FileText className="input-icon" size={16} />
              <textarea name="bio" value={formData.bio} onChange={handleChange} placeholder="Tell your neighbors about yourself..." rows={2} />
            </div>

            <div className="input-group">
              <MapPin className="input-icon" size={16} />
              <input type="text" name="city" value={formData.location.city} onChange={handleChange} placeholder="City" required />
            </div>
            
            <div className="input-group">
              <input type="text" name="pincode" value={formData.location.pincode} onChange={handleChange} placeholder="Pincode" required style={{ paddingLeft: '16px' }} />
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <ImageUpload 
              label="Profile Photo" 
              onUpload={(url) => setFormData({ ...formData, profilePhoto: url })} 
              preview={formData.profilePhoto}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={saving} style={{ marginTop: '20px' }}>
            {saving ? <span className="spinner-small"></span> : <><Save size={18} /> Save Changes</>}
          </button>
        </form>
      )}

      {/* ── Tabs Header ── */}
      <div className="ig-tabs">
        <div className="ig-tab active">
          <Grid3X3 size={16} /> Posts
        </div>
      </div>

      {/* ── POSTS GRID ── */}
      <div className="ig-posts-section">
        {loadingPosts ? (
          <div className="page-loader"><div className="spinner"></div></div>
        ) : posts.length === 0 ? (
          <div className="ig-empty-posts">
            <FileText size={48} strokeWidth={1} />
            <h3>Share your first post</h3>
            <p>When you share photos or updates, they'll appear here on your profile.</p>
          </div>
        ) : (
          <div className="ig-posts-grid">
            {posts.map((post, idx) => (
              <div
                key={post._id}
                className="ig-post-tile"
                onClick={() => setModalIndex(idx)}
              >
                {post.images && post.images.length > 0 && (
                  <img src={post.images[0]} alt="" className="ig-post-tile-thumb" />
                )}
                <div className="ig-post-tile-bg" />
                <span className="ig-post-tile-type" style={{ background: typeColors[post.type] || typeColors.general }}>
                  {post.type}
                </span>
                <p className="ig-post-tile-text">{post.content}</p>
                <div className="ig-post-tile-overlay">
                  <span><Heart size={16} fill="white" /> {post.likes?.length || 0}</span>
                  <span><MessageCircle size={16} fill="white" /> {post.comments?.length || 0}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
