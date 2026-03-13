import { useState, useEffect } from 'react';
import { PlusCircle, ShoppingBag, Trash2, Tag, MapPin, IndianRupee, Navigation, Globe } from 'lucide-react';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import LocationBanner from '../components/LocationBanner';
import ImageUpload from '../components/ImageUpload';

const categories = ['Electronics', 'Furniture', 'Clothing', 'Books', 'Vehicles', 'Services', 'Food', 'Other'];

const scopeLabels = {
  pincode: { text: 'your area', color: '#10b981', icon: <Navigation size={14} /> },
  city: { text: 'your city', color: '#f59e0b', icon: <MapPin size={14} /> },
  all: { text: 'everywhere', color: '#6366f1', icon: <Globe size={14} /> },
};

const Marketplace = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filterCat, setFilterCat] = useState('');
  const [newItem, setNewItem] = useState({
    title: '', description: '', price: '', category: 'Other', images: [],
  });
  const [creating, setCreating] = useState(false);
  const [scope, setScope] = useState('all');
  const [scopeLocation, setScopeLocation] = useState(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterCat) params.category = filterCat;
      const { data } = await API.get('/marketplace', { params });
      setItems(data.items || data);
      setScope(data.scope || 'all');
      setScopeLocation(data.location || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [filterCat]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await API.post('/marketplace', { ...newItem, price: Number(newItem.price) });
      setNewItem({ title: '', description: '', price: '', category: 'Other', images: [] });
      setShowCreate(false);
      fetchItems();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this listing?')) return;
    try {
      await API.delete(`/marketplace/${id}`);
      setItems(items.filter((i) => i._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkSold = async (id) => {
    try {
      await API.put(`/marketplace/${id}`, { status: 'sold' });
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  const scopeInfo = scopeLabels[scope] || scopeLabels.all;

  return (
    <div className="marketplace-page">
      <LocationBanner />

      <div className="page-header">
        <div>
          <h2><ShoppingBag size={24} /> Marketplace</h2>
          {user?.location?.city && (
            <p className="page-subtitle">
              <MapPin size={14} /> Local listings shown first
            </p>
          )}
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
          <PlusCircle size={18} /> Sell Item
        </button>
      </div>

      {showCreate && (
        <form className="create-post-card" onSubmit={handleCreate}>
          <input
            type="text"
            placeholder="Item title"
            value={newItem.title}
            onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
            required
          />
          <textarea
            placeholder="Description"
            value={newItem.description}
            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            rows={2}
            required
          />
          <div className="create-post-options">
            <input
              type="number"
              placeholder="Price (₹)"
              value={newItem.price}
              onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
              required
              min="0"
            />
            <select
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
            >
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <button type="submit" className="btn btn-primary" disabled={creating}>
              {creating ? <span className="spinner-small"></span> : 'List Item'}
            </button>
          </div>
          <ImageUpload
            multiple
            label="Add Photos"
            onUpload={(urls) => setNewItem({ ...newItem, images: [...newItem.images, ...(Array.isArray(urls) ? urls : [urls])] })}
          />
        </form>
      )}

      <div className="filter-bar">
        <Tag size={16} />
        <button
          className={`filter-chip ${!filterCat ? 'active' : ''}`}
          onClick={() => setFilterCat('')}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c}
            className={`filter-chip ${filterCat === c ? 'active' : ''}`}
            onClick={() => setFilterCat(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Scope indicator */}
      {!loading && items.length > 0 && (
        <div className="scope-indicator" style={{ borderColor: scopeInfo.color }}>
          <span style={{ color: scopeInfo.color }}>{scopeInfo.icon}</span>
          <span>
            Showing <strong>{items.length}</strong> item{items.length !== 1 ? 's' : ''} from{' '}
            <strong style={{ color: scopeInfo.color }}>
              {scopeLocation ? `${scopeLocation} (${scopeInfo.text})` : scopeInfo.text}
            </strong>
          </span>
        </div>
      )}

      {loading ? (
        <div className="page-loader"><div className="spinner"></div></div>
      ) : items.length === 0 ? (
        <div className="empty-state"><p>No items listed yet.</p></div>
      ) : (
        <div className="marketplace-grid">
          {items.map((item) => (
            <div key={item._id} className="market-card">
              <div className="market-card-header">
                <h3>{item.title}</h3>
                <span className="market-price"><IndianRupee size={14} />{item.price}</span>
              </div>
              <p className="market-desc">{item.description}</p>
              <div className="market-meta">
                <span className="market-category"><Tag size={13} /> {item.category}</span>
                {item.location?.city && (
                  <span className="market-location">
                    <MapPin size={13} /> {item.location.area ? `${item.location.area}, ` : ''}{item.location.city}
                    {item.location.pincode ? ` - ${item.location.pincode}` : ''}
                  </span>
                )}
              </div>
              <div className="market-seller">
                <span>By {item.seller?.name || 'Unknown'}</span>
                {item.seller?.phone && <span> • {item.seller.phone}</span>}
              </div>
              {item.seller?._id === user?._id && (
                <div className="market-actions">
                  <button className="btn btn-small btn-secondary" onClick={() => handleMarkSold(item._id)}>
                    Mark Sold
                  </button>
                  <button className="btn btn-small btn-danger" onClick={() => handleDelete(item._id)}>
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Marketplace;
