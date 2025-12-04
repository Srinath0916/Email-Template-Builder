import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiMail, FiUser, FiCalendar, FiDownload, FiSave, FiTrash2, FiEye } from 'react-icons/fi';
import Navbar from '../components/ui/Navbar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { exportToHTML } from '../utils/htmlExport';

const Receivers = () => {
  const [receivedTemplates, setReceivedTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    fetchReceivedTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchReceivedTemplates = async () => {
    try {
      const response = await axios.get('/api/received', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReceivedTemplates(response.data.receivedTemplates);
    } catch (error) {
      toast.error('Failed to load received templates');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await axios.patch(`/api/received/mark-read/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReceivedTemplates(receivedTemplates.map(item =>
        item._id === id ? { ...item, status: 'read' } : item
      ));
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleSaveToMyTemplates = async (id) => {
    try {
      await axios.post(`/api/received/save/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Template saved to your templates! 🎉');
    } catch (error) {
      toast.error('Failed to save template');
    }
  };

  const handleDownload = (template) => {
    const html = exportToHTML(template.templateId.blocks);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.templateId.name}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Template downloaded! 📤');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this received template?')) return;
    try {
      await axios.delete(`/api/received/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReceivedTemplates(receivedTemplates.filter(item => item._id !== id));
      toast.success('Received template deleted');
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handlePreview = (item) => {
    setSelectedTemplate(item);
    handleMarkAsRead(item._id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 font-display">
            Received Templates 📬
          </h1>
          <p className="text-gray-600 text-lg">Templates shared with you by other users</p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <div className="h-40 bg-gray-200 rounded mb-4" />
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </Card>
            ))}
          </div>
        ) : receivedTemplates.length === 0 ? (
          <Card className="text-center py-20">
            <FiMail className="mx-auto text-6xl text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No received templates</h3>
            <p className="text-gray-600">Templates shared with you will appear here</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {receivedTemplates.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow relative">
                  {item.status === 'unread' && (
                    <div className="absolute top-4 right-4 w-3 h-3 bg-primary-500 rounded-full animate-pulse" />
                  )}
                  
                  <div className="h-32 bg-gradient-to-br from-primary-100 to-accent-100 rounded-lg mb-4 flex items-center justify-center">
                    <FiMail className="text-primary-500" size={40} />
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2">
                    {item.templateId?.name || 'Untitled Template'}
                  </h3>

                  <div className="space-y-2 mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <FiUser size={14} />
                      <span>From: {item.senderId?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiCalendar size={14} />
                      <span>{new Date(item.receivedAt).toLocaleDateString()}</span>
                    </div>
                    {item.message && (
                      <p className="text-xs italic mt-2 p-2 bg-gray-50 rounded">
                        "{item.message}"
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<FiEye />}
                      onClick={() => handlePreview(item)}
                    >
                      Preview
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<FiSave />}
                      onClick={() => handleSaveToMyTemplates(item._id)}
                    >
                      Save
                    </Button>
                    <Button
                      variant="accent"
                      size="sm"
                      icon={<FiDownload />}
                      onClick={() => handleDownload(item)}
                    >
                      Download
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      icon={<FiTrash2 />}
                      onClick={() => handleDelete(item._id)}
                    >
                      Delete
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Preview Modal */}
        {selectedTemplate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto"
            >
              <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedTemplate.templateId?.name}
                  </h2>
                  <p className="text-sm text-gray-600">
                    From: {selectedTemplate.senderId?.name}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="p-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  {selectedTemplate.templateId?.blocks?.map((block, idx) => (
                    <div key={idx} className="mb-4">
                      {block.type === 'text' && (
                        <div style={{ color: block.styles?.color, fontSize: block.styles?.fontSize }}>
                          {block.content}
                        </div>
                      )}
                      {block.type === 'image' && (
                        <img src={block.src} alt="Block" className="max-w-full rounded" />
                      )}
                      {block.type === 'button' && (
                        <button
                          style={{
                            backgroundColor: block.styles?.backgroundColor,
                            color: block.styles?.color
                          }}
                          className="px-6 py-3 rounded-lg font-semibold"
                        >
                          {block.content}
                        </button>
                      )}
                      {block.type === 'divider' && <hr className="my-4" />}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Receivers;
