import { useState, useEffect } from 'react';
import { PlusCircle, Filter, Send, MapPin, Globe, Navigation } from 'lucide-react';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import LocationBanner from '../components/LocationBanner';
import ImageUpload from '../components/ImageUpload';

const postTypes = ['all', 'general', 'help', 'announcement', 'event', 'question'];

const scopeLabels = {
  pincode: { icon: <Navigation size={14} />, text: 'your area', color: '#10b981' },
  city: { icon: <MapPin size={14} />, text: 'your city', color: '#f59e0b' },
  all: { icon: <Globe size={14} />, text: 'everywhere', color: '#6366f1' },
};

const Home = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [newPost, setNewPost] = useState({ content: '', type: 'general', urgency: 'low', images: [] });
  const [creating, setCreating] = useState(false);
  const [scope, setScope] = useState('all');
  const [scopeLocation, setScopeLocation] = useState(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterType !== 'all') params.type = filterType;
      const { data } = await API.get('/posts', { params });
      setPosts(data.posts || data);
      setScope(data.scope || 'all');
      setScopeLocation(data.location || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [filterType]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.content.trim()) return;
    setCreating(true);
    try {
      await API.post('/posts', newPost);
      setNewPost({ content: '', type: 'general', urgency: 'low', images: [] });
      setShowCreate(false);
      fetchPosts();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = (postId) => {
    setPosts(posts.filter((p) => p._id !== postId));
  };

  const scopeInfo = scopeLabels[scope] || scopeLabels.all;

  return (
    <div className="home-page">
      <LocationBanner />

      <div className="page-header">
        <div>
          <h2>Community Feed</h2>
          {user?.location?.city && (
            <p className="page-subtitle">
              <MapPin size={14} /> {user.location.area ? `${user.location.area}, ` : ''}{user.location.city}
              {user.location.pincode ? ` - ${user.location.pincode}` : ''}
            </p>
          )}
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
          <PlusCircle size={18} /> New Post
        </button>
      </div>

      {showCreate && (
        <form className="create-post-card" onSubmit={handleCreatePost}>
          <textarea
            placeholder="What's happening in your community?"
            value={newPost.content}
            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
            rows={3}
            required
          />
          <div className="create-post-options">
            <select
              value={newPost.type}
              onChange={(e) => setNewPost({ ...newPost, type: e.target.value })}
            >
              <option value="general">General</option>
              <option value="help">Help Needed</option>
              <option value="announcement">Announcement</option>
              <option value="event">Event</option>
              <option value="question">Question</option>
            </select>
            <select
              value={newPost.urgency}
              onChange={(e) => setNewPost({ ...newPost, urgency: e.target.value })}
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            <button type="submit" className="btn btn-primary" disabled={creating}>
              {creating ? <span className="spinner-small"></span> : <><Send size={16} /> Post</>}
            </button>
          </div>
          <ImageUpload
            multiple
            label="Add Photos"
            onUpload={(urls) => setNewPost({ ...newPost, images: [...newPost.images, ...(Array.isArray(urls) ? urls : [urls])] })}
          />
        </form>
      )}

      <div className="filter-bar">
        <Filter size={16} />
        {postTypes.map((t) => (
          <button
            key={t}
            className={`filter-chip ${filterType === t ? 'active' : ''}`}
            onClick={() => setFilterType(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Scope indicator */}
      {!loading && posts.length > 0 && (
        <div className="scope-indicator" style={{ borderColor: scopeInfo.color }}>
          <span style={{ color: scopeInfo.color }}>{scopeInfo.icon}</span>
          <span>
            Showing <strong>{posts.length}</strong> post{posts.length !== 1 ? 's' : ''} from{' '}
            <strong style={{ color: scopeInfo.color }}>
              {scopeLocation ? `${scopeLocation} (${scopeInfo.text})` : scopeInfo.text}
            </strong>
          </span>
          {scope === 'all' && user?.location?.pincode && (
            <span className="scope-hint">No local posts yet — showing all community posts</span>
          )}
        </div>
      )}

      {loading ? (
        <div className="posts-list">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton-post">
              <div className="skeleton-header">
                <div className="skeleton skeleton-avatar" />
                <div className="skeleton-meta">
                  <div className="skeleton skeleton-line medium" />
                  <div className="skeleton skeleton-line short" />
                </div>
              </div>
              <div className="skeleton skeleton-line" />
              <div className="skeleton skeleton-line" />
              <div className="skeleton skeleton-image" />
              <div className="skeleton-footer">
                <div className="skeleton skeleton-action" />
                <div className="skeleton skeleton-action" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <MapPin size={32} />
          <p>No posts yet. Be the first to share something with your community!</p>
        </div>
      ) : (
        <div className="posts-list">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
