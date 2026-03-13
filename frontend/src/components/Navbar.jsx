import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  ShoppingBag,
  MessageCircle,
  Bell,
  User,
  Users,
  LogOut,
  Menu,
  X,
  MapPin,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import API from '../api';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await API.get('/notifications');
        const unread = data.filter((n) => !n.read).length;
        setUnreadCount(unread);
      } catch {
        // silent
      }
    };
    if (user) fetchNotifications();
    const interval = setInterval(() => {
      if (user) fetchNotifications();
    }, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/', icon: <Home size={20} />, label: 'Feed' },
    { to: '/people', icon: <Users size={20} />, label: 'People' },
    { to: '/marketplace', icon: <ShoppingBag size={20} />, label: 'Market' },
    { to: '/messages', icon: <MessageCircle size={20} />, label: 'Messages' },
    {
      to: '/notifications',
      icon: (
        <span className="nav-bell-wrap">
          <Bell size={20} />
          {unreadCount > 0 && <span className="nav-badge">{unreadCount}</span>}
        </span>
      ),
      label: 'Alerts',
    },
    { to: '/profile', icon: <User size={20} />, label: 'Profile' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <MapPin size={24} className="brand-icon" />
          <span>LocalConnect</span>
        </Link>

        <div className={`navbar-links ${mobileOpen ? 'open' : ''}`}>
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link ${isActive(link.to) ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              {link.icon}
              <span className="nav-label">{link.label}</span>
            </Link>
          ))}
          <button className="nav-link logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span className="nav-label">Logout</span>
          </button>
        </div>

        <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
