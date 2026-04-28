import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, Mail, Phone, MessageCircle, Calendar, Shield, ArrowLeft,
  Grid3X3, Heart, Clock, X, ChevronLeft, ChevronRight, Send, FileText
} from 'lucide-react';
import API from '../api';
import { useAuth } from '../context/AuthContext';

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

/* ─── Post Modal (Reusable logic from Profile) ─── */
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
                {post.author?.profilePhoto && post.author.profilePhoto !== 'no-photo.jpg' ? (
                  <img src={post.author.profilePhoto} alt="" className="ig-avatar-img" />
                ) : (
                  (post.author?.name || 'U').charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <span className="ig-modal-author-name">
                  {post.author?.username ? `@${post.author.username}` : post.author?.name}
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

const UserProfile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [modalIndex, setModalIndex] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: userProfile } = await API.get(`/auth/users/${id}`);
        setProfile(userProfile);
        
        setLoadingPosts(true);
        const { data: userPosts } = await API.get(`/posts/user/${id}`);
        setPosts(userPosts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setLoadingPosts(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="ig-profile-page">
        <div className="page-loader"><div className="spinner"></div></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="empty-state">
        <p>User not found.</p>
        <Link to="/people" className="btn btn-primary">Back to Community</Link>
      </div>
    );
  }

  const isOwnProfile = currentUser?._id === profile._id;
  const totalLikes = posts.reduce((s, p) => s + (p.likes?.length || 0), 0);
  const totalComments = posts.reduce((s, p) => s + (p.comments?.length || 0), 0);

  return (
    <div className="ig-profile-page">
      <button className="back-link" onClick={() => navigate(-1)} style={{ marginBottom: '16px', background: 'none', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
        <ArrowLeft size={18} /> Back
      </button>

      {/* ── Modal ── */}
      {modalIndex !== null && (
        <PostModal
          post={posts[modalIndex]}
          user={currentUser}
          onClose={() => setModalIndex(null)}
          onPrev={() => setModalIndex((i) => Math.max(0, i - 1))}
          onNext={() => setModalIndex((i) => Math.min(posts.length - 1, i + 1))}
          hasPrev={modalIndex > 0}
          hasNext={modalIndex < posts.length - 1}
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
              <div className="ig-avatar-inner">
                {profile.profilePhoto && profile.profilePhoto !== 'no-photo.jpg' ? (
                  <img src={profile.profilePhoto} alt="Avatar" className="ig-avatar-img" />
                ) : (
                  profile.name?.charAt(0)?.toUpperCase() || '?'
                )}
              </div>
            </div>
          </div>
          <div className="ig-profile-info">
            <h1 className="ig-username">{profile.name}</h1>
            <p className="ig-user-handle">
              {profile.username ? (
                <span className="ig-handle-text">@{profile.username}</span>
              ) : (
                <span className="ig-handle-text ig-handle-missing">No username set</span>
              )}
            </p>
            {profile.location?.city && (
              <p className="ig-user-location">
                <MapPin size={13} />
                {profile.location.area ? `${profile.location.area}, ` : ''}{profile.location.city}
              </p>
            )}
            <span className={`ig-role-badge ${profile.role === 'admin' ? 'admin' : ''}`}>
              <Shield size={11} /> {profile.role || 'user'}
            </span>
            {profile.bio && <p className="ig-bio">{profile.bio}</p>}
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

      {/* ── Actions / Tabs Header ── */}
      <div className="ig-tabs">
        <div className="ig-tab active">
          <Grid3X3 size={16} /> {profile.name}'s Posts
        </div>
        {!isOwnProfile && (
          <Link 
            to={`/messages?user=${profile._id}&name=${encodeURIComponent(profile.name)}`}
            className="ig-tab"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <MessageCircle size={16} /> Send Message
          </Link>
        )}
      </div>

      {/* ── POSTS GRID ── */}
      <div className="ig-posts-section">
        {loadingPosts ? (
          <div className="page-loader"><div className="spinner"></div></div>
        ) : posts.length === 0 ? (
          <div className="ig-empty-posts">
            <FileText size={48} strokeWidth={1} />
            <h3>No posts yet</h3>
            <p>This user hasn't shared anything with the community yet.</p>
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

export default UserProfile;
