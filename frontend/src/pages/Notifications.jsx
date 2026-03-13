import { useState, useEffect } from 'react';
import { Bell, CheckCheck, Heart, MessageCircle, AlertCircle, Send, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import API from '../api';

const iconMap = {
  like: <Heart size={16} className="notif-icon-like" />,
  comment: <MessageCircle size={16} className="notif-icon-comment" />,
  message: <Send size={16} className="notif-icon-message" />,
  default: <AlertCircle size={16} />,
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await API.get('/notifications');
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async () => {
    try {
      await API.put('/notifications/read');
      // Remove read notifications from the list so they disappear
      setNotifications([]);
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

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotifLink = (notif) => {
    if (notif.type === 'message') return `/messages?user=${notif.sender?._id}&name=${encodeURIComponent(notif.sender?.name || '')}`;
    if (notif.type === 'like' || notif.type === 'comment') return '/';
    return '#';
  };

  return (
    <div className="notifications-page">
      <div className="page-header">
        <h2><Bell size={24} /> Notifications</h2>
        {unreadCount > 0 && (
          <button className="btn btn-secondary" onClick={handleMarkRead}>
            <Trash2 size={16} /> Clear All ({unreadCount})
          </button>
        )}
      </div>

      {loading ? (
        <div className="page-loader"><div className="spinner"></div></div>
      ) : notifications.length === 0 ? (
        <div className="empty-state">
          <Bell size={32} />
          <p>All caught up! No new notifications.</p>
        </div>
      ) : (
        <div className="notif-list">
          {notifications.map((notif) => (
            <Link
              key={notif._id}
              to={getNotifLink(notif)}
              className={`notif-item ${!notif.read ? 'unread' : ''}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="notif-icon-wrap">
                {iconMap[notif.type] || iconMap.default}
              </div>
              <div className="notif-content">
                <p>
                  <strong>{notif.sender?.name || 'Someone'}</strong>
                  {notif.type === 'like' ? ' liked your post' : notif.type === 'comment' ? ' commented on your post' : notif.type === 'message' ? ' sent you a message' : ` sent you a ${notif.type}`}
                </p>
                <span className="notif-time">{timeAgo(notif.createdAt)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
