import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiMail, FiLogOut, FiInbox, FiHeart, FiHome, FiLock } from 'react-icons/fi';
import Button from './Button';

const Navbar = ({ showActions = false, onSave, onExport, onSend, onToggleFavourite, isFavourite = false, saving = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      <nav className="bg-white sticky top-0 z-50 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => navigate('/home')}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <FiMail className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 font-display">
                  Email Template Builder
                </h1>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              <button
                onClick={() => navigate('/home')}
                className="px-3 py-2 rounded-md hover:bg-gray-100 transition-colors flex items-center gap-2 text-gray-700 text-sm"
              >
                <FiHome size={16} />
                <span>Home</span>
              </button>
              <button
                onClick={() => navigate('/receivers')}
                className="px-3 py-2 rounded-md hover:bg-gray-100 transition-colors flex items-center gap-2 text-gray-700 text-sm"
              >
                <FiInbox size={16} />
                <span>Received</span>
              </button>
              <button
                onClick={() => navigate('/favourites')}
                className="px-3 py-2 rounded-md hover:bg-gray-100 transition-colors flex items-center gap-2 text-gray-700 text-sm"
              >
                <FiHeart size={16} />
                <span>Favourites</span>
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
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
                  {onToggleFavourite && (
                    <button
                      onClick={onToggleFavourite}
                      className={`px-2 py-2 rounded-md transition-colors ${
                        isFavourite 
                          ? 'text-red-500 hover:bg-red-50' 
                          : 'text-gray-400 hover:bg-gray-100 hover:text-red-500'
                      }`}
                      title={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
                    >
                      <FiHeart 
                        size={16} 
                        fill={isFavourite ? 'currentColor' : 'none'}
                      />
                    </button>
                  )}
                  {onSend && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={onSend}
                    >
                      Send
                    </Button>
                  )}
                  <Button
                    variant="accent"
                    size="sm"
                    onClick={onExport}
                  >
                    Export
                  </Button>
                </>
              )}

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden md:block">
                    {user?.name}
                  </span>
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                    <div className="p-3 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        navigate('/change-password');
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <FiLock size={14} />
                      Change Password
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <FiLogOut size={14} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
