import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Trash2, Send, MapPin, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api';

const typeColors = {
  help: '#ef4444',
  announcement: '#f59e0b',
  event: '#8b5cf6',
  question: '#3b82f6',
  general: '#6b7280',
};

const urgencyLabels = {
  low: '🟢 Low',
  medium: '🟡 Medium',
  high: '🟠 High',
  critical: '🔴 Critical',
};

const PostCard = ({ post, onDelete, onUpdate }) => {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [likes, setLikes] = useState(post.likes || []);
  const [comments, setComments] = useState(post.comments || []);
  const [liking, setLiking] = useState(false);

  const isLiked = likes.includes(user?._id);
  const isAuthor = post.author?._id === user?._id;

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
    try {
      const { data } = await API.put(`/posts/${post._id}/like`);
      setLikes(data);
      if (onUpdate) onUpdate(post._id, { likes: data });
    } catch (err) {
      console.error(err);
    } finally {
      setLiking(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const { data } = await API.post(`/posts/${post._id}/comments`, { text: commentText });
      setComments(data);
      setCommentText('');
      if (onUpdate) onUpdate(post._id, { comments: data });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return;
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
    <div className="post-card">
      <div className="post-header">
        <div className="post-author-info">
          <Link to={`/user/${post.author?._id}`} className="post-avatar-link">
            <div className="post-avatar">
              {post.author?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
          </Link>
          <div>
            <Link to={`/user/${post.author?._id}`} className="post-author-link">
              <h4 className="post-author-name">{post.author?.name || 'Unknown'}</h4>
            </Link>
            <div className="post-meta">
              <span className="post-time">
                <Clock size={13} /> {timeAgo(post.createdAt)}
              </span>
              {post.location?.city && (
                <span className="post-location">
                  <MapPin size={13} /> {post.location.area ? `${post.location.area}, ` : ''}{post.location.city}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="post-header-right">
          <span
            className="post-type-badge"
            style={{ background: typeColors[post.type] || typeColors.general }}
          >
            {post.type}
          </span>
          {post.urgency && post.urgency !== 'low' && (
            <span className="post-urgency">{urgencyLabels[post.urgency]}</span>
          )}
          {isAuthor && (
            <button className="post-delete-btn" onClick={handleDelete} title="Delete post">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      <p className="post-content">{post.content}</p>

      {post.images && post.images.length > 0 && (
        <div className="post-images">
          {post.images.map((img, i) => (
            <img key={i} src={img} alt="Post" className="post-image" />
          ))}
        </div>
      )}

      <div className="post-actions">
        <button
          className={`action-btn like-btn ${isLiked ? 'liked' : ''}`}
          onClick={handleLike}
        >
          <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
          <span>{likes.length}</span>
        </button>
        <button
          className="action-btn comment-btn"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle size={18} />
          <span>{comments.length}</span>
        </button>
      </div>

      {showComments && (
        <div className="post-comments">
          {comments.map((c, i) => (
            <div key={i} className="comment">
              <span className="comment-author">{c.user?.name || 'User'}</span>
              <span className="comment-text">{c.text}</span>
            </div>
          ))}
          <form className="comment-form" onSubmit={handleComment}>
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="comment-input"
            />
            <button type="submit" className="comment-send">
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostCard;
