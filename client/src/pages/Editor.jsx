import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../components/ui/Navbar';
import Palette from '../components/Palette';
import Canvas from '../components/Canvas';
import BlockEditor from '../components/BlockEditor';
import SendTemplateModal from '../components/modals/SendTemplateModal';
import { exportToHTML } from '../utils/htmlExport';

// Helper to get localStorage key for draft
const getDraftKey = (templateId) => templateId ? `draft_${templateId}` : 'draft_new';

// Clear all old drafts on app start
const clearOldDrafts = () => {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('draft_')) {
      try {
        const draft = JSON.parse(localStorage.getItem(key));
        // Remove drafts older than 24 hours
        if (Date.now() - draft.savedAt > 24 * 60 * 60 * 1000) {
          localStorage.removeItem(key);
        }
      } catch {
        localStorage.removeItem(key);
      }
    }
  });
};

const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth(); // Token is auto-added by axios interceptor
  const [templateName, setTemplateName] = useState(location.state?.templateName || 'Untitled Template');
  const [blocks, setBlocks] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [isFavourite, setIsFavourite] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Clear old drafts on mount
  useEffect(() => {
    clearOldDrafts();
  }, []);

  // Auto-save draft every 3 seconds when editing
  useEffect(() => {
    if (!isLoaded) return;
    
    const saveDraft = () => {
      const draftKey = getDraftKey(id);
      const draft = {
        templateName,
        blocks,
        savedAt: Date.now()
      };
      localStorage.setItem(draftKey, JSON.stringify(draft));
    };

    const timer = setTimeout(saveDraft, 3000);
    return () => clearTimeout(timer);
  }, [id, templateName, blocks, isLoaded]);

  // Clear draft after successful save
  const clearDraft = useCallback(() => {
    const draftKey = getDraftKey(id);
    localStorage.removeItem(draftKey);
    localStorage.removeItem('draft_new');
  }, [id]);

  const loadTemplate = useCallback(async () => {
    try {
      const response = await axios.get(`/api/templates/${id}`);
      
      // Check for unsaved draft
      const draftKey = getDraftKey(id);
      const savedDraft = localStorage.getItem(draftKey);
      
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          const serverTime = new Date(response.data.template.updatedAt).getTime();
          
          // If draft is newer than server version, restore it
          if (draft.savedAt > serverTime) {
            setTemplateName(draft.templateName);
            setBlocks(draft.blocks);
            setIsFavourite(response.data.template.isFavourite || false);
            setIsLoaded(true);
            return;
          }
        } catch (e) {
          console.error('Failed to parse draft:', e);
        }
      }
      
      setTemplateName(response.data.template.name);
      setBlocks(response.data.template.blocks || []);
      setIsFavourite(response.data.template.isFavourite || false);
      setIsLoaded(true);
    } catch (err) {
      toast.error('Failed to load template');
      navigate('/dashboard');
    }
  }, [id, navigate]);

  useEffect(() => {
    if (id) {
      loadTemplate();
    } else {
      // Check for draft when creating new template
      const draftKey = 'draft_new';
      const savedDraft = localStorage.getItem(draftKey);
      
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          setTemplateName(draft.templateName);
          setBlocks(draft.blocks);
          setIsLoaded(true);
          return;
        } catch (e) {
          console.error('Failed to parse draft:', e);
        }
      }
      
      setTemplateName(location.state?.templateName || 'Untitled Template');
      setBlocks([]);
      setSelectedBlock(null);
      setIsFavourite(false);
      setIsLoaded(true);
    }
  }, [id, loadTemplate, location.state?.templateName]);

  const handleToggleFavourite = async () => {
    if (!id) {
      toast.error('Please save the template first');
      return;
    }

    try {
      await axios.patch(`/api/templates/${id}/favourite`, {});
      setIsFavourite(!isFavourite);
      toast.success(isFavourite ? 'Removed from favourites' : 'Added to favourites ❤️');
    } catch (err) {
      toast.error('Failed to update favourite');
    }
  };



  const handleSave = async () => {
    if (!templateName.trim()) {
      toast.error('Please enter a template name');
      return;
    }

    setSaving(true);
    try {
      if (id) {
        // Update existing template
        await axios.put(`/api/templates/${id}`, { name: templateName, blocks });
        clearDraft(); // Clear draft after successful save
        toast.success('Template saved successfully! 💾');
      } else {
        // Create new template
        const response = await axios.post('/api/templates', { name: templateName, blocks });
        const newTemplateId = response.data.template._id;
        clearDraft(); // Clear the 'new' draft
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
      <div className="min-h-screen bg-gray-50">
        <Navbar 
          showActions={true}
          onSave={handleSave}
          onExport={handleExport}
          onSend={id ? () => setShowSendModal(true) : null}
          onToggleFavourite={handleToggleFavourite}
          isFavourite={isFavourite}
          saving={saving}
        />

        {/* Template Name Editor */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
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
            <p className="text-sm text-gray-500 mt-1.5">
              Click to rename • {blocks.length} {blocks.length === 1 ? 'block' : 'blocks'}
            </p>
          </div>

          {/* Editor Layout */}
          <div className="grid grid-cols-12 gap-5">
            {/* Left Palette */}
            <div className="col-span-12 lg:col-span-2">
              <Palette />
            </div>

            {/* Center Canvas */}
            <div className="col-span-12 lg:col-span-7">
              <Canvas
                blocks={blocks}
                setBlocks={setBlocks}
                selectedBlock={selectedBlock}
                setSelectedBlock={setSelectedBlock}
              />
            </div>

            {/* Right Property Editor */}
            <div className="col-span-12 lg:col-span-3">
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
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm sticky top-24">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">✨</span>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">
                    No Block Selected
                  </h3>
                  <p className="text-sm text-gray-500">
                    Select a block from the canvas to customize its properties
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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
