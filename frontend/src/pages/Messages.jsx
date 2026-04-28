import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Send, User, MessageCircle, ChevronLeft, Search } from 'lucide-react';
import API from '../api';
import { useAuth } from '../context/AuthContext';

const Messages = () => {
  const { user: currentUser } = useAuth();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const targetUserId = queryParams.get('user');
  const targetUserName = queryParams.get('name');
  const targetUserUsername = queryParams.get('username');

  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [search, setSearch] = useState('');
  
  const scrollRef = useRef();

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (targetUserId) {
      setSelectedUser({ _id: targetUserId, name: targetUserName, username: targetUserUsername });
      fetchMessages(targetUserId);
    }
  }, [targetUserId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    setLoadingMessages(true);
    try {
      const { data } = await API.get(`/messages/${userId}`);
      setMessages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const { data } = await API.post('/messages', {
        receiverId: selectedUser._id,
        content: newMessage,
      });
      setMessages([...messages, data]);
      setNewMessage('');
      fetchConversations(); // Refresh sidebar
    } catch (err) {
      console.error(err);
    }
  };

  const filteredConversations = conversations.filter(conv => 
    conv.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    conv.user?.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="messages-page">
      {/* Sidebar / Conversations Panel */}
      <div className={`conversations-panel ${selectedUser ? 'hidden-mobile' : ''}`}>
        <div className="conv-panel-header">
          <h3><MessageCircle size={18} /> Messages</h3>
        </div>
        
        <div className="search-bar conv-search">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search chats..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="conv-list">
          {loading ? (
            <div className="spinner-center"><div className="spinner-small"></div></div>
          ) : filteredConversations.length === 0 ? (
            <div className="empty-text">No conversations yet</div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv._id}
                className={`conv-item ${selectedUser?._id === conv.user?._id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedUser(conv.user);
                  fetchMessages(conv.user._id);
                }}
              >
                <div className="conv-avatar">
                  {conv.user?.profilePhoto && conv.user.profilePhoto !== 'no-photo.jpg' ? (
                    <img src={conv.user.profilePhoto} alt="" />
                  ) : (
                    conv.user?.name?.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="conv-info">
                  <span className="conv-name">{conv.user?.name}</span>
                  <span className="conv-preview">{conv.lastMessage.content}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area / Chat Panel */}
      <div className={`chat-panel ${!selectedUser ? 'hidden-mobile' : ''}`}>
        {selectedUser ? (
          <>
            <div className="chat-header">
              <button className="back-btn" onClick={() => setSelectedUser(null)}>
                <ChevronLeft />
              </button>
              <div className="chat-header-avatar">
                {selectedUser.profilePhoto && selectedUser.profilePhoto !== 'no-photo.jpg' ? (
                  <img src={selectedUser.profilePhoto} alt="" />
                ) : (
                  selectedUser.name?.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h4>{selectedUser.name}</h4>
                {selectedUser.username && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--primary-light)', display: 'block', marginTop: '-2px' }}>
                    @{selectedUser.username}
                  </span>
                )}
              </div>
            </div>

            <div className="chat-messages">
              {loadingMessages ? (
                <div className="spinner-center"><div className="spinner-small"></div></div>
              ) : (
                <>
                  {messages.map((msg, idx) => {
                    const isSent = msg.sender === currentUser?._id;
                    return (
                      <div key={msg._id} className={`chat-bubble-container ${isSent ? 'sent' : 'received'}`}>
                        <div className="chat-bubble">
                          <p>{msg.content}</p>
                          <span className="bubble-time">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={scrollRef} />
                </>
              )}
            </div>

            <form className="chat-input-area" onSubmit={handleSendMessage}>
              <div className="chat-input-pill">
                <input
                  type="text"
                  placeholder="Message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
              </div>
              <button type="submit" className="chat-send-btn" disabled={!newMessage.trim()}>
                <Send size={20} />
              </button>
            </form>
          </>
        ) : (
          <div className="chat-empty">
            <div className="chat-empty-icon">
              <MessageCircle size={48} strokeWidth={1} />
            </div>
            <h3>Your Messages</h3>
            <p>Send private photos and messages to a neighbor.</p>
            <button className="btn btn-primary btn-small" onClick={() => navigate('/people')}>
              New Message
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
