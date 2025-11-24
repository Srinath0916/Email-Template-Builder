import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiMessageSquare, FiHeart, FiTrash2, FiUser, FiCpu } from 'react-icons/fi';
import Navbar from '../components/ui/Navbar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Chats = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' or 'favourites'

  useEffect(() => {
    fetchChats();
  }, [filter]);

  const fetchChats = async () => {
    try {
      const response = await axios.get('/api/chats', {
        params: { favouritesOnly: filter === 'favourites' }
      });
      setChats(response.data.chats);
    } catch (error) {
      toast.error('Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavourite = async (chatId) => {
    try {
      await axios.patch(`/api/chats/${chatId}/favourite`);
      setChats(chats.map(chat => 
        chat._id === chatId 
          ? { ...chat, isFavourite: !chat.isFavourite }
          : chat
      ));
      toast.success('Favourite updated');
    } catch (error) {
      toast.error('Failed to update favourite');
    }
  };

  const deleteChat = async (chatId) => {
    if (!window.confirm('Delete this chat message?')) return;

    try {
      await axios.delete(`/api/chats/${chatId}`);
      setChats(chats.filter(chat => chat._id !== chatId));
      toast.success('Chat deleted');
    } catch (error) {
      toast.error('Failed to delete chat');
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'user':
        return <FiUser className="text-primary-500" size={20} />;
      case 'assistant':
        return <FiCpu className="text-accent-500" size={20} />;
      default:
        return <FiMessageSquare className="text-gray-500" size={20} />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'user':
        return 'from-primary-500 to-primary-600';
      case 'assistant':
        return 'from-accent-500 to-accent-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
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
            Chat History 💬
          </h1>
          <p className="text-gray-600 text-lg">
            View and manage your conversation history
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === 'all' ? 'primary' : 'secondary'}
            onClick={() => setFilter('all')}
          >
            All Chats
          </Button>
          <Button
            variant={filter === 'favourites' ? 'primary' : 'secondary'}
            onClick={() => setFilter('favourites')}
            icon={<FiHeart size={16} />}
          >
            Favourites
          </Button>
        </div>

        {/* Chat List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </Card>
            ))}
          </div>
        ) : chats.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
              <FiMessageSquare className="text-white" size={40} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {filter === 'favourites' ? 'No favourite chats yet' : 'No chats yet'}
            </h3>
            <p className="text-gray-600">
              {filter === 'favourites' 
                ? 'Mark chats as favourite to see them here'
                : 'Your chat history will appear here'
              }
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {chats.map((chat, index) => (
              <motion.div
                key={chat._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card hover className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Role Icon */}
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getRoleColor(chat.role)} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      {getRoleIcon(chat.role)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-gray-900 capitalize">
                          {chat.role}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(chat.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap break-words">
                        {chat.message}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => toggleFavourite(chat._id)}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                          chat.isFavourite
                            ? 'bg-red-100 text-red-600 hover:bg-red-200'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                      >
                        <FiHeart size={18} fill={chat.isFavourite ? 'currentColor' : 'none'} />
                      </button>
                      <button
                        onClick={() => deleteChat(chat._id)}
                        className="w-10 h-10 rounded-lg bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Chats;
