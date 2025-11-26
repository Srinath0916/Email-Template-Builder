import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiType, FiImage, FiSquare, FiAlignLeft, FiAlignCenter, FiAlignRight } from 'react-icons/fi';
import Button from './ui/Button';

const BlockEditor = ({ block, onUpdate, onClose }) => {
  const [content, setContent] = useState(block.content);
  const [src, setSrc] = useState(block.src || '');
  const [color, setColor] = useState(block.styles?.color || '#000000');
  const [backgroundColor, setBackgroundColor] = useState(block.styles?.backgroundColor || '#0ea5e9');
  const [fontSize, setFontSize] = useState(block.styles?.fontSize || '16px');
  const [textAlign, setTextAlign] = useState(block.styles?.textAlign || 'left');

  const handleSave = () => {
    onUpdate({
      ...block,
      content,
      src,
      styles: {
        color,
        backgroundColor,
        fontSize,
        textAlign
      }
    });
  };

  const getIcon = () => {
    switch (block.type) {
      case 'text': return <FiType />;
      case 'image': return <FiImage />;
      case 'button': return <FiSquare />;
      default: return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass rounded-xl overflow-hidden sticky top-24"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-accent-500 p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              {getIcon()}
            </div>
            <div>
              <h3 className="text-lg font-bold font-display">
                Edit {block.type.charAt(0).toUpperCase() + block.type.slice(1)}
              </h3>
              <p className="text-sm text-white/80">Customize your block</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
        {/* Content Editor */}
        {(block.type === 'text' || block.type === 'button') && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary-500 focus:outline-none transition-colors resize-none"
              placeholder="Enter your content..."
            />
          </div>
        )}

        {/* Image URL */}
        {block.type === 'image' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Image URL
            </label>
            <input
              type="text"
              value={src}
              onChange={(e) => setSrc(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary-500 focus:outline-none transition-colors"
              placeholder="https://example.com/image.jpg"
            />
            {src && (
              <div className="mt-3 rounded-lg overflow-hidden">
                <img src={src} alt="Preview" className="w-full" />
              </div>
            )}
          </div>
        )}

        {/* Text Color */}
        {(block.type === 'text' || block.type === 'button') && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Text Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-16 h-12 rounded-lg cursor-pointer border-2 border-gray-200"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary-500 focus:outline-none transition-colors font-mono text-sm"
              />
            </div>
          </div>
        )}

        {/* Background Color (Button only) */}
        {block.type === 'button' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Background Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-16 h-12 rounded-lg cursor-pointer border-2 border-gray-200"
              />
              <input
                type="text"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary-500 focus:outline-none transition-colors font-mono text-sm"
              />
            </div>
          </div>
        )}

        {/* Font Size */}
        {(block.type === 'text' || block.type === 'button') && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Font Size
            </label>
            <select
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary-500 focus:outline-none transition-colors cursor-pointer"
            >
              <option value="12px">12px - Small</option>
              <option value="14px">14px - Regular</option>
              <option value="16px">16px - Medium</option>
              <option value="18px">18px - Large</option>
              <option value="20px">20px - Extra Large</option>
              <option value="24px">24px - Heading</option>
              <option value="32px">32px - Title</option>
            </select>
          </div>
        )}

        {/* Text Alignment */}
        {(block.type === 'text' || block.type === 'button') && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Text Alignment
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'left', icon: FiAlignLeft, label: 'Left' },
                { value: 'center', icon: FiAlignCenter, label: 'Center' },
                { value: 'right', icon: FiAlignRight, label: 'Right' }
              ].map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  onClick={() => setTextAlign(value)}
                  className={`
                    px-4 py-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1
                    ${textAlign === value
                      ? 'border-primary-500 bg-primary-50 text-primary-600'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Apply Button */}
        <Button
          onClick={handleSave}
          variant="primary"
          size="lg"
          className="w-full"
        >
          Apply Changes
        </Button>
      </div>
    </motion.div>
  );
};

export default BlockEditor;
