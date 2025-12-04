import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiUser, FiArrowRight } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await signup(name, email, password);
    
    if (result.success) {
      toast.success('Account created successfully! 🎉');
      navigate('/home');
    } else {
      toast.error(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="lg:hidden mb-6">
              <div className="inline-flex items-center gap-2 text-primary-600 mb-4">
                <FiMail size={24} />
                <span className="font-semibold text-xl">Email Template Builder</span>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2 font-display">
              Create your account
            </h2>
            <p className="text-gray-600">
              Start building professional email templates today
            </p>
          </div>
          
          <Card className="p-8 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Full Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                icon={<FiUser size={18} />}
                required
              />

              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                icon={<FiMail size={18} />}
                required
              />

              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                icon={<FiLock size={18} />}
                required
                minLength="6"
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                loading={loading}
                icon={<FiArrowRight size={16} />}
              >
                Create Account
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-primary-600 hover:text-primary-700 font-semibold"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </Card>
          
          <p className="text-center text-xs text-gray-500 mt-6">
            By creating an account, you agree to our Terms and Privacy Policy
          </p>
        </div>
      </div>

      {/* Right Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-bg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/95 to-purple-700/95"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 text-white">
          <div className="mb-10">
            <h1 className="text-5xl xl:text-6xl font-bold font-display mb-6 leading-tight drop-shadow-sm">
              Start Building<br />Today
            </h1>
            <p className="text-xl text-white mb-8 max-w-md leading-relaxed">
              Create, customize, and share beautiful email templates in minutes with our intuitive builder.
            </p>
          </div>
          
          <div className="space-y-5 max-w-md">
            <div className="bg-white/15 backdrop-blur-md rounded-xl p-5 border border-white/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-md">
                  <span className="text-2xl">🎨</span>
                </div>
                <h3 className="text-lg font-bold">Visual Editor</h3>
              </div>
              <p className="text-white/95 text-sm leading-relaxed">
                Design emails visually without writing any code
              </p>
            </div>
            
            <div className="bg-white/15 backdrop-blur-md rounded-xl p-5 border border-white/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-md">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-lg font-bold">Export Instantly</h3>
              </div>
              <p className="text-white/95 text-sm leading-relaxed">
                Download production-ready HTML with one click
              </p>
            </div>
            
            <div className="bg-white/15 backdrop-blur-md rounded-xl p-5 border border-white/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-md">
                  <span className="text-2xl">🤝</span>
                </div>
                <h3 className="text-lg font-bold">Share & Collaborate</h3>
              </div>
              <p className="text-white/95 text-sm leading-relaxed">
                Send templates to teammates and work together
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
