import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiEdit2, FiDownload, FiArrowLeft, FiHeart } from 'react-icons/fi';
import Navbar from '../components/ui/Navbar';
import Button from '../components/ui/Button';
import { exportToHTML } from '../utils/htmlExport';

const TemplatePreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavourite, setIsFavourite] = useState(false);

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        const response = await axios.get(`/api/templates/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTemplate(response.data.template);
        setIsFavourite(response.data.template.isFavourite || false);
      } catch (err) {
        toast.error('Failed to load template');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    loadTemplate();
  }, [id, token, navigate]);

  const handleToggleFavourite = async () => {
    try {
      await axios.patch(`/api/templates/${id}/favourite`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsFavourite(!isFavourite);
      toast.success(isFavourite ? 'Removed from favourites' : 'Added to favourites ❤️');
    } catch (err) {
      toast.error('Failed to update favourite');
    }
  };

  const handleExport = () => {
    const html = exportToHTML(template.blocks);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.name}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('HTML exported successfully! 📤');
  };

  const renderBlock = (block) => {
    const style = {
      padding: `${block.padding || 20}px`,
      backgroundColor: block.backgroundColor || '#ffffff',
      textAlign: block.alignment || 'left',
    };

    switch (block.type) {
      case 'text':
        return (
          <div style={style}>
            <div
              style={{
                fontSize: `${block.fontSize || 16}px`,
                color: block.color || '#000000',
                fontWeight: block.bold ? 'bold' : 'normal',
                fontStyle: block.italic ? 'italic' : 'normal',
                textDecoration: block.underline ? 'underline' : 'none',
              }}
              dangerouslySetInnerHTML={{ __html: block.content || 'Text block' }}
            />
          </div>
        );

      case 'image':
        return (
          <div style={style}>
            {block.src ? (
              <img
                src={block.src}
                alt={block.alt || 'Image'}
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: `${block.borderRadius || 0}px`,
                }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '200px',
                  backgroundColor: '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: `${block.borderRadius || 0}px`,
                }}
              >
                <span style={{ color: '#9ca3af' }}>No image</span>
              </div>
            )}
          </div>
        );

      case 'button':
        return (
          <div style={style}>
            <a
              href={block.url || '#'}
              style={{
                display: 'inline-block',
                padding: `${block.buttonPadding || 12}px ${block.buttonPadding * 2 || 24}px`,
                backgroundColor: block.buttonColor || '#3b82f6',
                color: block.textColor || '#ffffff',
                textDecoration: 'none',
                borderRadius: `${block.borderRadius || 6}px`,
                fontSize: `${block.fontSize || 16}px`,
                fontWeight: '600',
              }}
            >
              {block.text || 'Button'}
            </a>
          </div>
        );

      case 'divider':
        return (
          <div style={style}>
            <hr
              style={{
                border: 'none',
                borderTop: `${block.thickness || 1}px ${block.style || 'solid'} ${block.color || '#e5e7eb'}`,
                margin: 0,
              }}
            />
          </div>
        );

      case 'spacer':
        return <div style={{ height: `${block.height || 20}px` }} />;

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (!template) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <FiArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 font-display">
                {template.name}
              </h1>
              <p className="text-gray-600">
                {template.blocks?.length || 0} blocks • Last updated {new Date(template.updatedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleToggleFavourite}
                className={`p-3 rounded-lg transition-colors ${
                  isFavourite 
                    ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                    : 'text-gray-400 bg-white hover:bg-gray-100 hover:text-red-500 border border-gray-200'
                }`}
                title={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
              >
                <FiHeart size={20} fill={isFavourite ? 'currentColor' : 'none'} />
              </button>
              <Button
                variant="secondary"
                icon={<FiDownload size={18} />}
                onClick={handleExport}
              >
                Export HTML
              </Button>
              <Button
                variant="primary"
                icon={<FiEdit2 size={18} />}
                onClick={() => navigate(`/editor/${id}`)}
              >
                Edit Template
              </Button>
            </div>
          </div>
        </div>

        {/* Template Preview */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gray-100 px-6 py-3 border-b border-gray-200">
            <p className="text-sm text-gray-600 font-medium">Preview</p>
          </div>
          <div className="p-8">
            <div
              style={{
                maxWidth: '600px',
                margin: '0 auto',
                backgroundColor: '#ffffff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              {template.blocks && template.blocks.length > 0 ? (
                template.blocks.map((block) => (
                  <div key={block.id}>{renderBlock(block)}</div>
                ))
              ) : (
                <div className="text-center py-20 text-gray-500">
                  This template is empty
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatePreview;
