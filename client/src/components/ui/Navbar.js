import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiMail, FiLogOut, FiKey, FiInbox, FiHeart, FiHome } from 'react-icons/fi';
import Button from './Button';
import ForgotPasswordModal from '../modals/ForgotPasswordModal';

const Navbar = ({ showActions = false, onSave, onExport, onShare, onSend, saving = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="glass sticky top-0 z-50 border-b border-gray-200/50"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div 
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate('/home')}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg">
                <FiMail className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text font-display">
                  EmailBuilder Pro
                </h1>
                <p className="text-xs text-gray-500">Drag. Drop. Design.</p>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => navigate('/home')}
                className="px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 text-gray-700"
              >
                <FiHome size={18} />
                <span>Home</span>
              </button>
              <button
                onClick={() => navigate('/receivers')}
                className="px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 text-gray-700"
              >
                <FiInbox size={18} />
                <span>Receivers</span>
              </button>
              <button
                onClick={() => navigate('/favourites')}
                className="px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 text-gray-700"
              >
                <FiHeart size={18} />
                <span>Favourites</span>
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {showActions && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={onSave}
                    loading={saving}
                  >
                    Save
                  </Button>
                  {onSend && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={onSend}
                    >
                      Send
                    </Button>
                  )}
                  {onShare && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onShare}
                    >
                      Share
                    </Button>
                  )}
                  <Button
                    variant="accent"
                    size="sm"
                    onClick={onExport}
                  >
                    Export HTML
                  </Button>
                </>
              )}

              {/* User Menu */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full flex items-center justify-center text-white font-semibold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden md:block">
                    {user?.name}
                  </span>
                </motion.button>

                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-56 glass rounded-xl shadow-xl overflow-hidden"
                  >
                    <div className="p-3 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setShowForgotPassword(true);
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <FiKey size={16} />
                      Change Password
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <FiLogOut size={16} />
                      Logout
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </>
  );
};

export default Navbar;
