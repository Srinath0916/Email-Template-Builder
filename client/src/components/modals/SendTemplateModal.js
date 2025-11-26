import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSend } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';
import Button from '../ui/Button';
import Input from '../ui/Input';

const SendTemplateModal = ({ isOpen, onClose, templateId, token }) => {
  const [receiverIdentifier, setReceiverIdentifier] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);

    try {
      await axios.post('/api/send-template', 
        { templateId, receiverIdentifier, message },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Template sent successfully! 🎉');
      onClose();
      setReceiverIdentifier('');
      setMessage('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send template');
    } finally {
      setSending(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl"
          >
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 font-display">
                Send Template
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleSend} className="p-6 space-y-6">
              <Input
                label="Receiver Email or Username"
                type="text"
                value={receiverIdentifier}
                onChange={(e) => setReceiverIdentifier(e.target.value)}
                placeholder="user@example.com or username"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add a personal message..."
                  rows="4"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary-500 focus:outline-none transition-colors resize-none"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  icon={<FiSend />}
                  loading={sending}
                  className="flex-1"
                >
                  Send
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SendTemplateModal;
