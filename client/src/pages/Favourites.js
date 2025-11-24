import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiHeart, FiMail, FiMessageSquare, FiEdit2, FiTrash2, FiLayers, FiCalendar } from 'react-icons/fi';
import Navbar from '../components/ui/Navbar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Favourites = () => {
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'template', 'chat'
  const navigate = useNavigate();

  useEffect(() => {
    fetchFavourites();
  }, [filter]);

  const fetchFavourites = async () => {
    try {
      const params = filter !== 'all' ? { type: filter } : {};
      const response = await axios.get('/api/favourites', { params });
      setFavourites(response.data.favourites);
    } catch (error) {
      toast.error('Failed to load favourites');
    } finally {
      setLoading(false);
    }
  };

  const removeFavourite = async (favouriteId) => {
    try {
      await axios.delete(`/api/favourites/${favouriteId}`);
      setFavourites(favourites.filter(fav => fav._id !== favouriteId));
      toast.success('Removed from favourites');
    } catch (error) {
      toast.error('Failed to remove favourite');
    }
  };

  const renderTemplateCard = (favourite, index) => {
    const template = favourite.itemId;
    if (!template) return null;

    return (
      <motion.div
        key={favourite._id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <Card hover className="p-6 group">
          <div className="mb-4">
            <div className="w-full h-32 bg-gradient-to-br from-primary-100 to-accent-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <FiMail className="text-primary-500" size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">
              {template.name}
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <FiLayers size={14} />
                <span>{template.blocks?.length || 0} blocks</span>
              </div>
              <div className="flex items-center gap-1">
                <FiCalendar size={14} />
                <span>{new Date(template.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<FiEdit2 size={16} />}
              onClick={() => navigate(`/editor/${template._id}`)}
              className="flex-1"
            >
              Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={<FiHeart size={16} />}
              onClick={() => removeFavourite(favourite._id)}
            >
              Unfavourite
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  };

  const renderChatCard = (favourite, index) => {
    const chat = favourite.itemId;
    if (!chat) return null;

    return (
      <motion.div
        key={favourite._id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <Card hover className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center flex-shrink-0 shadow-lg">
              <FiMessageSquare className="text-white" size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-gray-900 capitalize">
                  {chat.role}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(chat.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-gray-700 line-clamp-3">
                {chat.message}
              </p>
            </div>
            <button
              onClick={() => removeFavourite(favourite._id)}
              className="w-10 h-10 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center transition-colors flex-shrink-0"
            >
              <FiTrash2 size={18} />
            </button>
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2 font-display">
            Favourites ❤️
          </h1>
          <p className="text-gray-600 text-lg">
            Your saved templates and chat messages
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === 'all' ? 'primary' : 'secondary'}
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'template' ? 'primary' : 'secondary'}
            onClick={() => setFilter('template')}
            icon={<FiMail size={16} />}
          >
            Templates
          </Button>
          <Button
            variant={filter === 'chat' ? 'primary' : 'secondary'}
            onClick={() => setFilter('chat')}
            icon={<FiMessageSquare size={16} />}
          >
            Chats
          </Button>
        </div>

        {/* Favourites List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-32 bg-gray-200 rounded-lg mb-4" />
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </Card>
            ))}
          </div>
        ) : favourites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
              <FiHeart className="text-white" size={40} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No favourites yet
            </h3>
            <p className="text-gray-600 mb-6">
              Mark templates or chats as favourite to see them here
            </p>
            <Button
              variant="primary"
              onClick={() => navigate('/home')}
            >
              Browse Templates
            </Button>
          </motion.div>
        ) : (
          <div className={filter === 'template' || filter === 'all' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {favourites.map((favourite, index) => {
              if (favourite.itemType === 'template') {
                return renderTemplateCard(favourite, index);
              } else {
                return renderChatCard(favourite, index);
              }
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favourites;
