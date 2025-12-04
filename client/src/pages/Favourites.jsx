import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiHeart, FiMail, FiEdit2 } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/ui/Navbar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

// Enhanced Favourites page
const Favourites = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { token } = useAuth();

  useEffect(() => {
    fetchFavourites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchFavourites = async () => {
    try {
      const response = await axios.get('/api/templates?favouritesOnly=true', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTemplates(response.data.templates);
    } catch (error) {
      toast.error('Failed to load favourites');
    } finally {
      setLoading(false);
    }
  };

  const removeFavourite = async (id) => {
    try {
      await axios.patch(`/api/templates/${id}/favourite`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTemplates(templates.filter(item => item._id !== id));
      toast.success('Removed from favourites');
    } catch (error) {
      toast.error('Failed to remove favourite');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 font-display">
            Favourite Templates ❤️
          </h1>
          <p className="text-gray-600 text-lg">Your saved favourite templates</p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <div className="h-32 bg-gray-200 rounded mb-4" />
                <div className="h-4 bg-gray-200 rounded" />
              </Card>
            ))}
          </div>
        ) : templates.length === 0 ? (
          <Card className="text-center py-20">
            <FiMail className="mx-auto text-6xl text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No favourite templates</h3>
            <p className="text-gray-600">Mark templates as favourite to see them here</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {templates.map((template, index) => (
              <motion.div
                key={template._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <div className="h-32 bg-gradient-to-br from-primary-100 to-accent-100 rounded-lg mb-4 flex items-center justify-center">
                    <FiMail className="text-primary-500" size={40} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<FiEdit2 />}
                      onClick={() => navigate(`/editor/${template._id}`)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      icon={<FiHeart />}
                      onClick={() => removeFavourite(template._id)}
                    >
                      Remove
                    </Button>
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

export default Favourites;
