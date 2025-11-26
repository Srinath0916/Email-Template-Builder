import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMail, FiSend } from 'react-icons/fi';
import { toast } from 'react-toastify';
import axios from 'axios';
import Button from '../ui/Button';
import Input from '../ui/Input';

const ShareModal = ({ isOpen, onClose, templateId, templateName }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleShare = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('/api/share', {
        templateId,
        recipientEmail: email
      });

      toast.success(`Template shared with ${email}!`);
      setEmail('');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to share template');
    } finally {
      setLoading(false);
    }
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
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative glass rounded-2xl p-8 w-full max-w-md z-10"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FiX size={20} />
          </button>

          {/* Header */}
          <div className="mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center mb-4">
              <FiSend className="text-white" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 font-display">
              Share Template
            </h2>
            <p className="text-gray-600">
              Send "{templateName}" to someone via email
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleShare} className="space-y-4">
            <Input
              label="Recipient Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="recipient@example.com"
              icon={<FiMail size={20} />}
              required
            />

            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="flex-1"
                loading={loading}
                icon={<FiSend size={18} />}
              >
                Send
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ShareModal;
