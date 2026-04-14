import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api';
import {
  Save, MapPin, User, Phone, Mail, Shield,
  Grid3X3, Settings, Heart, MessageCircle, Clock,
  Edit3, FileText, X, ChevronLeft, ChevronRight, Trash2, Send,
  Camera, Loader2, ShoppingBag, Tag, IndianRupee
} from 'lucide-react';

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

/* ─── Post Modal (Instagram lightbox style) ─── */
const PostModal = ({ post, user, onClose, onPrev, onNext, hasPrev, hasNext, onDelete }) => {
  const [likes, setLikes] = useState(post.likes || []);
  const [comments, setComments] = useState(post.comments || []);
  const [commentText, setCommentText] = useState('');
  const [liking, setLiking] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isLiked = likes.includes(user?._id);

  // Sync if post prop changes (prev/next navigation)
  useEffect(() => {
    setLikes(post.likes || []);
    setComments(post.comments || []);
    setCommentText('');
  }, [post._id]);

  // Close on backdrop click
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
    // Optimistic update
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
      // Revert on error
      setLikes(post.likes || []);
    } finally {
      setLiking(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || commenting) return;
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

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await API.delete(`/posts/${post._id}`);
      onDelete(post._id);
    } catch (err) {
      console.error('Delete failed:', err);
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  };

  if (!post) return null;

  return (
    <div className="ig-modal-backdrop" onClick={handleBackdrop}>
      {/* Prev / Next arrows */}
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
        {/* Left: image / cover area */}
        <div className="ig-modal-left">
          {post.images && post.images.length > 0 ? (
            <img src={post.images[0]} alt="Post" className="ig-modal-main-img" />
          ) : (
            <div className="ig-modal-no-image">
              <span
                className="ig-modal-type-badge"
                style={{ background: typeColors[post.type] || typeColors.general }}
              >
                {post.type}
              </span>
              <p className="ig-modal-content-preview">{post.content}</p>
            </div>
          )}
        </div>

        {/* Right: details */}
        <div className="ig-modal-right">
          {/* Header */}
          <div className="ig-modal-header">
            <div className="ig-modal-author">
              <div className="ig-modal-avatar">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <span className="ig-modal-author-name">{user?.name}</span>
                {post.location?.city && (
                  <span className="ig-modal-location">
                    <MapPin size={11} />
                    {post.location.area ? `${post.location.area}, ` : ''}
                    {post.location.city}
                  </span>
                )}
              </div>
            </div>
            <div className="ig-modal-header-actions">
              {confirmDelete ? (
                <div className="ig-modal-confirm-row">
                  <span className="ig-modal-confirm-text">Delete?</span>
                  <button
                    className="ig-modal-confirm-yes"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? <span className="spinner-small" /> : 'Delete'}
                  </button>
                  <button
                    className="ig-modal-confirm-no"
                    onClick={() => setConfirmDelete(false)}
                    disabled={deleting}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  className="ig-modal-delete"
                  onClick={() => setConfirmDelete(true)}
                  title="Delete post"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button className="ig-modal-close" onClick={onClose}>
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Type + time */}
          <div className="ig-modal-meta">
            <span
              className="ig-modal-type-pill"
              style={{ background: typeColors[post.type] || typeColors.general }}
            >
              {post.type}
            </span>
            <span className="ig-modal-time">
              <Clock size={12} /> {timeAgo(post.createdAt)}
            </span>
          </div>

          {/* Content + Comments — scrollable */}
          <div className="ig-modal-body">
            <p className="ig-modal-text">{post.content}</p>

            {/* Extra images */}
            {post.images && post.images.length > 1 && (
              <div className="ig-modal-extra-images">
                {post.images.slice(1).map((img, i) => (
                  <img key={i} src={img} alt="Post" className="ig-modal-extra-img" />
                ))}
              </div>
            )}

            {/* Comments list */}
            {comments.length > 0 && (
              <div className="ig-modal-comments-inline">
                <div className="ig-modal-comments-divider" />
                {comments.map((c, i) => (
                  <div key={i} className="ig-modal-comment">
                    <div className="ig-modal-comment-avatar">
                      {(c.user?.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="ig-modal-comment-body">
                      <span className="ig-modal-comment-author">{c.user?.name || 'User'}</span>
                      <span className="ig-modal-comment-text">{c.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stats row — like button + count */}
          <div className="ig-modal-stats">
            <button
              className={`ig-modal-like-btn ${isLiked ? 'liked' : ''}`}
              onClick={handleLike}
              disabled={liking}
            >
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

          {/* Comment input */}
          <form className="ig-modal-comment-form" onSubmit={handleComment}>
            <input
              type="text"
              className="ig-modal-comment-input"
              placeholder="Add a comment…"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              maxLength={300}
            />
            <button
              type="submit"
              className="ig-modal-comment-send"
              disabled={!commentText.trim() || commenting}
            >
              {commenting ? <span className="spinner-small" /> : <Send size={16} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Profile Page ─── */
const Profile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('posts');
  const [form, setForm] = useState({ name: '', phone: '', city: '', area: '', pincode: '', bio: '' });
  const [posts, setPosts] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [modalIndex, setModalIndex] = useState(null); // index into posts[]
  const [photoUploading, setPhotoUploading] = useState(false);
  const [marketItems, setMarketItems] = useState([]);
  const [loadingMarket, setLoadingMarket] = useState(false);

  /* Fetch profile */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await API.get('/auth/me');
        setForm({
          name: data.name || '',
          phone: data.phone || '',
          city: data.location?.city || '',
          area: data.location?.area || '',
          pincode: data.location?.pincode || '',
          bio: data.bio || '',
        });
      } catch (err) { console.error(err); }
      finally { setLoadingProfile(false); }
    })();
  }, []);

  /* Fetch user's own posts */
  useEffect(() => {
    if (!user?._id) return;
    setLoadingPosts(true);
    (async () => {
      try {
        const { data } = await API.get(`/posts/user/${user._id}`);
        setPosts(data);
      } catch (err) { console.error(err); }
      finally { setLoadingPosts(false); }
    })();
  }, [user?._id]);

  /* Fetch user's marketplace items */
  useEffect(() => {
    if (!user?._id || activeTab !== 'marketplace') return;
    setLoadingMarket(true);
    (async () => {
      try {
        const { data } = await API.get(`/marketplace/user/${user._id}`);
        setMarketItems(data);
      } catch (err) { console.error(err); }
      finally { setLoadingMarket(false); }
    })();
  }, [user?._id, activeTab]);
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPhotoUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      // 1. Upload to ImageKit
      const { data: uploadData } = await API.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // 2. Update user profile with new photo URL
      const { data: userData } = await API.put('/auth/profile', {
        profilePhoto: uploadData.url,
      });

      updateUser(userData);
      setMessage('Profile photo updated!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Failed to upload photo.');
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const { data } = await API.put('/auth/profile', {
        name: form.name,
        phone: form.phone,
        bio: form.bio,
        location: { city: form.city, area: form.area, pincode: form.pincode },
      });
      updateUser(data);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Update failed.');
    } finally { setSaving(false); }
  };

  const totalLikes = posts.reduce((s, p) => s + (p.likes?.length || 0), 0);
  const totalComments = posts.reduce((s, p) => s + (p.comments?.length || 0), 0);

  const handleDeletePost = (deletedId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedId));
    setModalIndex(null);
  };

  if (loadingProfile) return (
    <div className="ig-profile-page">
      <div className="skeleton-profile-header">
        <div className="skeleton skeleton-profile-avatar" />
        <div className="skeleton-profile-info">
          <div className="skeleton skeleton-line medium" />
          <div className="skeleton skeleton-line short" />
          <div className="skeleton skeleton-line" />
        </div>
      </div>
      <div className="ig-stats-bar">
        {[1, 2, 3].map(i => (
          <div key={i} className="ig-stat">
            <div className="skeleton skeleton-line" style={{ width: '40px' }} />
            <div className="skeleton skeleton-line short" />
          </div>
        ))}
      </div>
    </div>
  );

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
          onDelete={handleDeletePost}
        />
      )}

      {/* ── Cover + Avatar ── */}
      <div className="ig-cover-section">
        <div className="ig-cover-bg">
          <div className="ig-cover-gradient" />
        </div>
        <div className="ig-profile-identity">
          <div className="ig-avatar-wrapper">
            <div className="ig-avatar-ring">
              <div 
                className="ig-avatar-inner clickable" 
                onClick={() => document.getElementById('profile-photo-input').click()}
                title="Change Profile Photo"
              >
                {photoUploading ? (
                  <Loader2 className="spin" size={32} />
                ) : user?.profilePhoto && user.profilePhoto !== 'no-photo.jpg' ? (
                  <img src={user.profilePhoto} alt="Avatar" className="ig-avatar-img" />
                ) : (
                  user?.name?.charAt(0)?.toUpperCase() || '?'
                )}
                <div className="ig-avatar-overlay">
                  <Camera size={20} />
                </div>
              </div>
            </div>
            <input
              id="profile-photo-input"
              type="file"
              hidden
              accept="image/*"
              onChange={handlePhotoUpload}
            />
          </div>
          <div className="ig-profile-info">
            <h1 className="ig-username">{user?.name || 'Your Name'}</h1>
            <p className="ig-user-handle"><Mail size={13} /> {user?.email}</p>
            {(form.city || form.area) && (
              <p className="ig-user-location">
                <MapPin size={13} />
                {form.area ? `${form.area}, ` : ''}{form.city}
                {form.pincode ? ` – ${form.pincode}` : ''}
              </p>
            )}
            <span className={`ig-role-badge ${user?.role === 'admin' ? 'admin' : ''}`}>
              <Shield size={11} /> {user?.role || 'user'}
            </span>
            {user?.bio && <p className="ig-bio">{user.bio}</p>}
          </div>
          <div className="ig-profile-actions">
            <button 
              className={`ig-btn-edit ${activeTab === 'edit' ? 'active' : ''}`}
              onClick={() => setActiveTab(activeTab === 'edit' ? 'posts' : 'edit')}
            >
              <Settings size={15} /> Edit Profile
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
          <span className="ig-stat-label">Likes Recv'd</span>
        </div>
        <div className="ig-stat-divider" />
        <div className="ig-stat">
          <span className="ig-stat-value">{totalComments}</span>
          <span className="ig-stat-label">Comments</span>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="ig-tabs">
        <button
          className={`ig-tab ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          <Grid3X3 size={16} /> Posts
        </button>
        <button
          className={`ig-tab ${activeTab === 'marketplace' ? 'active' : ''}`}
          onClick={() => setActiveTab('marketplace')}
        >
          <ShoppingBag size={16} /> Marketplace
        </button>
      </div>

      {/* ── POSTS TAB ── */}
      {activeTab === 'posts' && (
        <div className="ig-posts-section">
          {loadingPosts ? (
            <div className="page-loader"><div className="spinner"></div></div>
          ) : posts.length === 0 ? (
            <div className="ig-empty-posts">
              <FileText size={48} strokeWidth={1} />
              <h3>No posts yet</h3>
              <p>Share something with your community from the Home feed!</p>
            </div>
          ) : (
            <div className="ig-posts-grid">
              {posts.map((post, idx) => (
                <div
                  key={post._id}
                  className="ig-post-tile"
                  onClick={() => setModalIndex(idx)}
                >
                  {/* Background colour from type */}
                  <div
                    className="ig-post-tile-bg"
                    style={{ background: `${typeColors[post.type] || typeColors.general}22` }}
                  />

                  {/* Type chip */}
                  <span
                    className="ig-post-tile-type"
                    style={{ background: typeColors[post.type] || typeColors.general }}
                  >
                    {post.type}
                  </span>

                  {/* Text preview */}
                  <p className="ig-post-tile-text">{post.content}</p>

                  {/* Image thumbnail if available */}
                  {post.images && post.images.length > 0 && (
                    <img
                      src={post.images[0]}
                      alt="Post thumbnail"
                      className="ig-post-tile-thumb"
                    />
                  )}

                  {/* Hover overlay — IG style */}
                  <div className="ig-post-tile-overlay">
                    <span><Heart size={16} fill="white" /> {post.likes?.length || 0}</span>
                    <span><MessageCircle size={16} /> {post.comments?.length || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── MARKETPLACE TAB ── */}
      {activeTab === 'marketplace' && (
        <div className="ig-market-section">
          {loadingMarket ? (
            <div className="page-loader"><div className="spinner"></div></div>
          ) : marketItems.length === 0 ? (
            <div className="ig-empty-posts">
              <ShoppingBag size={48} strokeWidth={1} />
              <h3>No listings yet</h3>
              <p>Items you list for sale will appear here.</p>
            </div>
          ) : (
            <div className="ig-posts-grid">
              {marketItems.map((item) => (
                <div key={item._id} className="ig-market-tile">
                  {item.images && item.images.length > 0 ? (
                    <img src={item.images[0]} alt={item.title} className="ig-market-tile-img" />
                  ) : (
                    <div className="ig-market-no-img"><ShoppingBag size={40} /></div>
                  )}
                  <div className="ig-market-tile-overlay">
                    <span className="ig-market-tile-price">₹{item.price}</span>
                    <span className="ig-market-tile-title">{item.title}</span>
                  </div>
                  {item.status === 'sold' && <div className="ig-market-sold-badge">SOLD</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── EDIT PROFILE section ── */}
      {activeTab === 'edit' && (
        <div className="ig-edit-section">
          <div className="ig-edit-card">
            <div className="ig-edit-card-header">
              <Edit3 size={20} />
              <h2>Edit Profile</h2>
            </div>

            {message && (
              <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="ig-edit-form">
              <div className="ig-edit-section-title"><User size={15} /> Personal Info</div>

              <div className="ig-edit-field">
                <label>Full Name</label>
                <div className="ig-input-wrap">
                  <User size={15} className="ig-input-icon" />
                  <input
                    type="text"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="ig-edit-field">
                <label>Bio (max 150 characters)</label>
                <div className="ig-input-wrap" style={{ alignItems: 'flex-start' }}>
                  <FileText size={15} className="ig-input-icon" style={{ marginTop: '12px' }} />
                  <textarea
                    placeholder="Tell your neighbors about yourself"
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    maxLength={150}
                    rows={3}
                    style={{ 
                      width: '100%', 
                      padding: '10px 12px 10px 40px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text)',
                      fontFamily: 'inherit',
                      resize: 'none'
                    }}
                  />
                </div>
              </div>

              <div className="ig-edit-field">
                <label>Phone Number</label>
                <div className="ig-input-wrap">
                  <Phone size={15} className="ig-input-icon" />
                  <input
                    type="tel"
                    placeholder="Your phone number"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="ig-edit-field">
                <label>Email <span className="ig-readonly-badge">Read only</span></label>
                <div className="ig-input-wrap">
                  <Mail size={15} className="ig-input-icon" />
                  <input type="email" value={user?.email || ''} readOnly className="ig-readonly-input" />
                </div>
              </div>

              <div className="ig-edit-section-title" style={{ marginTop: '8px' }}>
                <MapPin size={15} /> Location
              </div>

              <div className="ig-edit-row">
                <div className="ig-edit-field">
                  <label>City</label>
                  <div className="ig-input-wrap">
                    <MapPin size={15} className="ig-input-icon" />
                    <input
                      type="text"
                      placeholder="City"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                    />
                  </div>
                </div>
                <div className="ig-edit-field">
                  <label>Area</label>
                  <div className="ig-input-wrap">
                    <input
                      type="text"
                      placeholder="Area / Locality"
                      value={form.area}
                      onChange={(e) => setForm({ ...form, area: e.target.value })}
                    />
                  </div>
                </div>
                <div className="ig-edit-field">
                  <label>Pincode</label>
                  <div className="ig-input-wrap">
                    <input
                      type="text"
                      placeholder="Pincode"
                      value={form.pincode}
                      onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="ig-save-btn" disabled={saving}>
                {saving ? <span className="spinner-small"></span> : <><Save size={16} /> Save Changes</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
