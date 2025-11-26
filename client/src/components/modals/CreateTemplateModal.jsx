import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMail } from 'react-icons/fi';
import Button from '../ui/Button';
import Input from '../ui/Input';

const CreateTemplateModal = ({ isOpen, onClose, onConfirm }) => {
  const [templateName, setTemplateName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (templateName.trim()) {
      onConfirm(templateName.trim());
      setTemplateName('');
    }
  };

  const handleClose = () => {
    setTemplateName('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-white rounded-2xl p-8 w-full max-w-md z-10 shadow-2xl"
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FiX size={20} />
          </button>

          {/* Header */}
          <div className="mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center mb-4">
              <FiMail className="text-white" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 font-display">
              Create New Template
            </h2>
            <p className="text-gray-600">
              Give your email template a name
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Template Name"
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g., Welcome Email, Newsletter, Promotion"
              icon={<FiMail size={20} />}
              required
              autoFocus
            />

            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="flex-1"
              >
                Create
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreateTemplateModal;
