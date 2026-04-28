import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Trash2, Send, MapPin, Clock, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api';

const typeColors = {
  help: '#ef4444',
  announcement: '#f59e0b',
  event: '#8b5cf6',
  question: '#3b82f6',
  general: '#6366f1',
};

const PostCard = ({ post, onDelete, onUpdate }) => {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [likes, setLikes] = useState(post.likes || []);
  const [comments, setComments] = useState(post.comments || []);
  const [liking, setLiking] = useState(false);
  const [commenting, setCommenting] = useState(false);

  const isLiked = likes.includes(user?._id);
  const isAuthor = post.author?._id === user?._id;

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
      if (onUpdate) onUpdate(post._id, { likes: data });
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
      if (onUpdate) onUpdate(post._id, { comments: data });
    } catch (err) {
      console.error(err);
    } finally {
      setCommenting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await API.delete(`/posts/${post._id}`);
      if (onDelete) onDelete(post._id);
    } catch (err) {
      console.error(err);
    }
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

  return (
    <div className="post-card premium-card">
      <div className="post-header">
        <div className="post-author-info">
          <Link to={`/user/${post.author?._id}`} className="post-avatar-link">
            <div className="post-avatar">
              {post.author?.profilePhoto && post.author.profilePhoto !== 'no-photo.jpg' ? (
                <img src={post.author.profilePhoto} alt="" className="ig-avatar-img" />
              ) : (
                post.author?.name?.charAt(0)?.toUpperCase() || '?'
              )}
            </div>
          </Link>
          <div className="post-author-meta">
            <Link to={`/user/${post.author?._id}`} className="post-author-link">
              <span className="post-author-name">
                {post.author?.username ? `@${post.author.username}` : post.author?.name || 'Unknown User'}
              </span>
            </Link>
            <div className="post-meta-sub">
              {post.location?.city && <span className="post-location">{post.location.city} • </span>}
              <span className="post-time">{timeAgo(post.createdAt)}</span>
            </div>
          </div>
        </div>
        
        <div className="post-header-actions">
          <span className="post-type-pill" style={{ borderColor: typeColors[post.type] || typeColors.general, color: typeColors[post.type] || typeColors.general }}>
            {post.type}
          </span>
          {isAuthor && (
            <button className="post-more-btn" onClick={handleDelete}>
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="post-body">
        <p className="post-text">{post.content}</p>
      </div>

      {post.images && post.images.length > 0 && (
        <div className="post-media-container">
          {post.images.map((img, i) => (
            <img key={i} src={img} alt="" className="post-media-img" />
          ))}
        </div>
      )}

      <div className="post-interactions">
        <div className="interaction-icons">
          <button className={`interaction-btn like ${isLiked ? 'liked' : ''}`} onClick={handleLike} disabled={liking}>
            <Heart size={24} fill={isLiked ? 'var(--accent)' : 'none'} color={isLiked ? 'var(--accent)' : 'currentColor'} />
          </button>
          <button className="interaction-btn" onClick={() => setShowComments(!showComments)}>
            <MessageCircle size={24} />
          </button>
        </div>
        
        <div className="post-stats">
          <span className="likes-count"><strong>{likes.length}</strong> likes</span>
        </div>

        {showComments && (
          <div className="post-comments-section">
            <div className="comments-list">
              {comments.map((c, i) => (
                <div key={i} className="comment-item">
                  <span className="comment-username">
                    {c.user?.username ? `@${c.user.username}` : c.user?.name || 'User'}
                  </span>
                  <span className="comment-body">{c.text}</span>
                </div>
              ))}
            </div>
            <form className="comment-input-row" onSubmit={handleComment}>
              <input type="text" placeholder="Add a comment..." value={commentText} onChange={(e) => setCommentText(e.target.value)} />
              <button type="submit" disabled={!commentText.trim() || commenting}>Post</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;
