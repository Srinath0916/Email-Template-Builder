import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  FiPlus, FiEdit2, FiTrash2, FiSearch, FiMail, 
  FiCalendar, FiLayers, FiTrendingUp, FiHeart 
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import Navbar from '../components/ui/Navbar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import CreateTemplateModal from '../components/modals/CreateTemplateModal';

const Dashboard = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const fetchTemplates = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/templates', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTemplates(response.data.templates);
    } catch (err) {
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Refetch templates when user returns to dashboard
  useEffect(() => {
    const handleFocus = () => {
      fetchTemplates();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchTemplates]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this template?')) return;

    try {
      await axios.delete(`/api/templates/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Template deleted successfully');
      // Refetch templates to ensure fresh state
      await fetchTemplates();
    } catch (err) {
      toast.error('Failed to delete template');
    }
  };

  const handleToggleFavourite = async (id, currentStatus) => {
    try {
      await axios.patch(`/api/templates/${id}/favourite`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state immediately for better UX
      setTemplates(templates.map(t => 
        t._id === id ? { ...t, isFavourite: !currentStatus } : t
      ));
      
      toast.success(currentStatus ? 'Removed from favourites' : 'Added to favourites ❤️');
    } catch (err) {
      toast.error('Failed to update favourite');
    }
  };

  const handleCreateTemplate = (templateName) => {
    setShowCreateModal(false);
    navigate('/editor', { state: { templateName } });
  };

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    { label: 'Total Templates', value: templates.length, icon: FiLayers, color: 'from-blue-500 to-cyan-500' },
    { label: 'This Month', value: templates.filter(t => new Date(t.createdAt) > new Date(Date.now() - 30*24*60*60*1000)).length, icon: FiTrendingUp, color: 'from-purple-500 to-pink-500' },
    { label: 'Total Blocks', value: templates.reduce((acc, t) => acc + (t.blocks?.length || 0), 0), icon: FiMail, color: 'from-orange-500 to-red-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2 font-display">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-gray-600 text-lg">
            Manage your email templates and create new ones
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                    <stat.icon className="text-white" size={24} />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Search and Create */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none transition-colors"
            />
          </div>
          <Button
            variant="primary"
            size="lg"
            icon={<FiPlus size={20} />}
            onClick={() => setShowCreateModal(true)}
            className="md:w-auto"
          >
            Create New Template
          </Button>
        </div>

        {/* Templates Grid */}
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
        ) : filteredTemplates.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
              <FiMail className="text-white" size={40} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {searchQuery ? 'No templates found' : 'No templates yet'}
            </h3>
            <p className="text-gray-600">
              {searchQuery ? 'Try a different search term' : 'Use the "Create New Template" button above to get started'}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template, index) => (
              <motion.div
                key={template._id}
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
                    <div className="flex items-center gap-4 text-sm text-gray-600">
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
                    <button
                      onClick={() => handleToggleFavourite(template._id, template.isFavourite)}
                      className={`p-2 rounded-lg transition-all ${
                        template.isFavourite 
                          ? 'bg-red-50 text-red-500 hover:bg-red-100' 
                          : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-red-500'
                      }`}
                      title={template.isFavourite ? 'Remove from favourites' : 'Add to favourites'}
                    >
                      <FiHeart 
                        size={18} 
                        fill={template.isFavourite ? 'currentColor' : 'none'}
                      />
                    </button>
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
                      icon={<FiTrash2 size={16} />}
                      onClick={() => handleDelete(template._id)}
                    >
                      Delete
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Template Modal */}
      <CreateTemplateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onConfirm={handleCreateTemplate}
      />
    </div>
  );
};

export default Dashboard;
