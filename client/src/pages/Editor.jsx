import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../components/ui/Navbar';
import Palette from '../components/Palette';
import Canvas from '../components/Canvas';
import BlockEditor from '../components/BlockEditor';
import ShareModal from '../components/modals/ShareModal';
import SendTemplateModal from '../components/modals/SendTemplateModal';
import { exportToHTML } from '../utils/htmlExport';

const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [templateName, setTemplateName] = useState('Untitled Template');
  const [blocks, setBlocks] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);

  const loadTemplate = React.useCallback(async () => {
    try {
      const response = await axios.get(`/api/templates/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTemplateName(response.data.template.name);
      setBlocks(response.data.template.blocks || []);
      toast.success('Template loaded successfully');
    } catch (err) {
      toast.error('Failed to load template');
      navigate('/dashboard');
    }
  }, [id, token, navigate]);

  useEffect(() => {
    if (id) {
      loadTemplate();
    } else {
      // Reset state when creating new template
      setTemplateName('Untitled Template');
      setBlocks([]);
      setSelectedBlock(null);
    }
  }, [id, loadTemplate]);



  const handleSave = async () => {
    if (!templateName.trim()) {
      toast.error('Please enter a template name');
      return;
    }

    setSaving(true);
    try {
      if (id) {
        await axios.put(`/api/templates/${id}`, 
          { name: templateName, blocks },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Template saved successfully! 💾');
      } else {
        const response = await axios.post('/api/templates',
          { name: templateName, blocks },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const newTemplateId = response.data.template._id;
        toast.success('Template created successfully! 🎉');
        // Navigate to edit mode with the new template ID
        navigate(`/editor/${newTemplateId}`, { replace: true });
      }
    } catch (err) {
      console.error('Save error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to save template';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    const html = exportToHTML(blocks);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${templateName}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('HTML exported successfully! 📤');
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar 
          showActions={true}
          onSave={handleSave}
          onExport={handleExport}
          onShare={() => setShowShareModal(true)}
          onSend={id ? () => setShowSendModal(true) : null}
          saving={saving}
        />

        {/* Template Name Editor */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-4 mb-6"
          >
            {isEditingName ? (
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyPress={(e) => e.key === 'Enter' && setIsEditingName(false)}
                className="text-2xl font-bold text-gray-900 bg-transparent border-none outline-none w-full font-display"
                autoFocus
              />
            ) : (
              <h2
                onClick={() => setIsEditingName(true)}
                className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-primary-600 transition-colors font-display"
              >
                {templateName}
              </h2>
            )}
            <p className="text-sm text-gray-600 mt-1">
              Click the title to rename • {blocks.length} blocks
            </p>
          </motion.div>

          {/* Editor Layout */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left Palette */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="col-span-12 lg:col-span-2"
            >
              <Palette />
            </motion.div>

            {/* Center Canvas */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="col-span-12 lg:col-span-7"
            >
              <Canvas
                blocks={blocks}
                setBlocks={setBlocks}
                selectedBlock={selectedBlock}
                setSelectedBlock={setSelectedBlock}
              />
            </motion.div>

            {/* Right Property Editor */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="col-span-12 lg:col-span-3"
            >
              {selectedBlock ? (
                <BlockEditor
                  block={selectedBlock}
                  onUpdate={(updatedBlock) => {
                    setBlocks(blocks.map(b => b.id === updatedBlock.id ? updatedBlock : b));
                    setSelectedBlock(updatedBlock);
                  }}
                  onClose={() => setSelectedBlock(null)}
                />
              ) : (
                <div className="glass rounded-xl p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">✨</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Block Selected
                  </h3>
                  <p className="text-sm text-gray-600">
                    Click on a block in the canvas to edit its properties
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {id && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          templateId={id}
          templateName={templateName}
        />
      )}

      {/* Send Template Modal */}
      {id && (
        <SendTemplateModal
          isOpen={showSendModal}
          onClose={() => setShowSendModal(false)}
          templateId={id}
          token={token}
        />
      )}
    </DndProvider>
  );
};

export default Editor;
