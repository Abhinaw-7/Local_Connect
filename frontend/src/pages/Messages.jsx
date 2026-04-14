import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Send, MessageCircle, ArrowLeft, Users, Search } from 'lucide-react';
import API from '../api';
import { useAuth } from '../context/AuthContext';

const Messages = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const messagesEndRef = useRef(null);

  // Check URL params for deep-link to a conversation
  useEffect(() => {
    const userId = searchParams.get('user');
    const userName = searchParams.get('name');
    if (userId && userName) {
      setSelectedUser({ _id: userId, name: userName });
    }
  }, [searchParams]);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser._id);
      const interval = setInterval(() => fetchMessages(selectedUser._id), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const { data } = await API.get('/messages/conversations/all');
      setConversations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const { data } = await API.get(`/messages/${userId}`);
      setMessages(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !selectedUser || sending) return;
    setSending(true);
    try {
      await API.post('/messages', { receiverId: selectedUser._id, content: text });
      setText('');
      fetchMessages(selectedUser._id);
      fetchConversations(); // Refresh sidebar
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleSearchUsers = async () => {
    if (!searchQuery.trim()) return;
    try {
      const { data } = await API.get('/auth/users', { params: { search: searchQuery } });
      setSearchResults(data);
    } catch (err) {
      console.error(err);
    }
  };

  const startConversation = (u) => {
    setSelectedUser({ _id: u._id, name: u.name });
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const timeFormat = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const dateLabel = (date) => {
    const d = new Date(date);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="messages-page">
      <div className={`conversations-panel ${selectedUser ? 'hidden-mobile' : ''}`}>
        <div className="conv-panel-header">
          <h3><MessageCircle size={20} /> Chats</h3>
          <button
            className="btn btn-primary btn-small"
            onClick={() => setShowSearch(!showSearch)}
            title="Start new conversation"
          >
            <Users size={14} /> New
          </button>
        </div>

        {showSearch && (
          <div className="conv-search">
            <div className="conv-search-input">
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchUsers()}
              />
              <button className="btn btn-small btn-secondary" onClick={handleSearchUsers}>
                <Search size={14} />
              </button>
            </div>
            {searchResults.length > 0 && (
              <div className="conv-search-results">
                {searchResults.map((u) => (
                  <div key={u._id} className="conv-item" onClick={() => startConversation(u)}>
                    <div className="conv-avatar">{u.name.charAt(0).toUpperCase()}</div>
                    <div className="conv-info">
                      <span className="conv-name">{u.name}</span>
                      <span className="conv-preview">{u.location?.city || 'Neighborhood member'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="page-loader"><div className="spinner"></div></div>
        ) : conversations.length === 0 && !showSearch ? (
          <div className="empty-text-wrap">
            <p className="empty-text">No conversations yet</p>
            <button className="btn btn-primary btn-small" onClick={() => setShowSearch(true)}>
              <Users size={14} /> Find people
            </button>
          </div>
        ) : (
          <div className="conv-list">
            {conversations.map((conv) => (
              <div
                key={conv._id}
                className={`conv-item ${selectedUser?._id === conv._id ? 'active' : ''}`}
                onClick={() => setSelectedUser({ _id: conv._id, name: conv.user.name })}
              >
                <div className="conv-avatar">{conv.user.name.charAt(0).toUpperCase()}</div>
                <div className="conv-info">
                  <span className="conv-name">{conv.user.name}</span>
                  <span className="conv-preview">
                    {conv.lastMessage.content.length > 35
                      ? conv.lastMessage.content.substring(0, 35) + '...'
                      : conv.lastMessage.content}
                  </span>
                </div>
                <span className="conv-time">{dateLabel(conv.lastMessage.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={`chat-panel ${!selectedUser ? 'hidden-mobile' : ''}`}>
        {selectedUser ? (
          <>
            <div className="chat-header">
              <button className="back-btn" onClick={() => setSelectedUser(null)}>
                <ArrowLeft size={20} />
              </button>
              <Link to={`/user/${selectedUser._id}`} className="chat-header-link">
                <div className="chat-header-avatar">{selectedUser.name.charAt(0).toUpperCase()}</div>
                <div>
                  <h4>{selectedUser.name}</h4>
                  <span className="chat-header-subtitle">Tap to view profile</span>
                </div>
              </Link>
            </div>
            <div className="chat-messages">
              {messages.length === 0 && (
                <div className="chat-empty-inline">
                  <p>No messages yet. Say hello! 👋</p>
                </div>
              )}
              {messages.map((msg, i) => {
                const isSent = msg.sender === user._id || msg.sender?._id === user._id;
                const prevMsg = messages[i - 1];
                const nextMsg = messages[i + 1];

                const isPrevSameAuthor = prevMsg && (prevMsg.sender === msg.sender || prevMsg.sender?._id === msg.sender?._id);
                const isNextSameAuthor = nextMsg && (nextMsg.sender === msg.sender || nextMsg.sender?._id === msg.sender?._id);
                
                const showDate = !prevMsg || 
                  new Date(msg.createdAt).toDateString() !== new Date(prevMsg.createdAt).toDateString();
                
                return (
                  <div key={msg._id} className="chat-msg-row">
                    {showDate && (
                      <div className="chat-date-divider">
                        <span>{dateLabel(msg.createdAt)}</span>
                      </div>
                    )}
                    <div className={`chat-bubble-container ${isSent ? 'sent' : 'received'} ${!isNextSameAuthor ? 'last-in-group' : ''} ${!isPrevSameAuthor ? 'first-in-group' : ''}`}>
                      <div className="chat-bubble">
                        <p>{msg.content}</p>
                        <span className="bubble-time">{timeFormat(msg.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            <form className="chat-input-area" onSubmit={handleSend}>
              <div className="chat-input-pill">
                <input
                  type="text"
                  placeholder="Message..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="chat-send-btn" disabled={sending}>
                  <Send size={20} />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="chat-empty">
            <MessageCircle size={48} />
            <h3>Your Messages</h3>
            <p>Select a conversation or start a new one</p>
            <Link to="/people" className="btn btn-primary" style={{ marginTop: '12px' }}>
              <Users size={16} /> Find People
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
