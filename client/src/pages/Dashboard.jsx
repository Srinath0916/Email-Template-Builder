import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1 font-display">
                Welcome back, {user?.name}
              </h1>
              <p className="text-gray-600">
                Here's what's happening with your templates today
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
              icon={<FiPlus size={18} />}
              onClick={() => setShowCreateModal(true)}
              className="hidden md:flex"
            >
              New Template
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {stats.map((stat, idx) => (
            <Card key={stat.label} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                  idx === 0 ? 'bg-blue-100' : idx === 1 ? 'bg-purple-100' : 'bg-green-100'
                }`}>
                  <stat.icon className={
                    idx === 0 ? 'text-blue-600' : idx === 1 ? 'text-purple-600' : 'text-green-600'
                  } size={24} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Templates Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-32 bg-gray-200 rounded-lg mb-4" />
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </Card>
            ))}
          </div>
        ) : filteredTemplates.length === 0 ? (
          <Card className="text-center py-20">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FiMail className="text-primary-600" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No templates found' : 'No templates yet'}
            </h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              {searchQuery ? 'Try a different search term' : 'Create your first template and start building beautiful emails'}
            </p>
            {!searchQuery && (
              <Button
                variant="primary"
                icon={<FiPlus size={18} />}
                onClick={() => setShowCreateModal(true)}
              >
                Create Your First Template
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTemplates.map((template) => (
              <Card key={template._id} className="group hover:shadow-xl transition-all duration-200 overflow-hidden">
                <div 
                  className="p-6 cursor-pointer"
                  onClick={() => navigate(`/template/${template._id}`)}
                >
                  <div className="w-full h-32 bg-gradient-to-br from-primary-50 to-purple-50 rounded-lg flex items-center justify-center mb-4 border border-gray-100 group-hover:scale-105 transition-transform">
                    <FiMail className="text-primary-500" size={36} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                    {template.name}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    <div className="flex items-center gap-1.5">
                      <FiLayers size={14} />
                      <span>{template.blocks?.length || 0} blocks</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FiCalendar size={14} />
                      <span>{new Date(template.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="px-6 pb-6 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavourite(template._id, template.isFavourite);
                    }}
                    className={`p-2.5 rounded-lg transition-colors ${
                      template.isFavourite 
                        ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                        : 'text-gray-400 hover:bg-gray-100 hover:text-red-500'
                    }`}
                    title={template.isFavourite ? 'Remove from favourites' : 'Add to favourites'}
                  >
                    <FiHeart 
                      size={16} 
                      fill={template.isFavourite ? 'currentColor' : 'none'}
                    />
                  </button>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<FiEdit2 size={14} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/editor/${template._id}`);
                    }}
                    className="flex-1"
                  >
                    Edit
                  </Button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(template._id);
                    }}
                    className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete template"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </Card>
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
