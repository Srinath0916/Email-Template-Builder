import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      toast.success('Welcome back! 🎉');
      navigate('/home');
    } else {
      toast.error(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-bg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/95 to-purple-700/95"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 text-white">
          <div className="mb-10">
            <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm px-5 py-2.5 rounded-full border border-white/30 mb-8 shadow-lg">
              <FiMail size={22} />
              <span className="font-semibold text-lg">Email Template Builder</span>
            </div>
            <h1 className="text-5xl xl:text-6xl font-bold font-display mb-6 leading-tight drop-shadow-sm">
              Build Beautiful<br />Email Templates
            </h1>
            <p className="text-xl text-white mb-8 max-w-md leading-relaxed">
              Create professional email templates with our drag-and-drop builder. No coding required.
            </p>
          </div>
          
          <div className="space-y-5 max-w-md">
            <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-md">
                <span className="text-primary-600 font-bold">✓</span>
              </div>
              <div>
                <h3 className="font-bold mb-1 text-lg">Drag & Drop Interface</h3>
                <p className="text-white/95 text-sm leading-relaxed">Build templates visually with our intuitive editor</p>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-md">
                <span className="text-primary-600 font-bold">✓</span>
              </div>
              <div>
                <h3 className="font-bold mb-1 text-lg">Export Ready HTML</h3>
                <p className="text-white/95 text-sm leading-relaxed">Download production-ready code instantly</p>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-md">
                <span className="text-primary-600 font-bold">✓</span>
              </div>
              <div>
                <h3 className="font-bold mb-1 text-lg">Share Templates</h3>
                <p className="text-white/95 text-sm leading-relaxed">Collaborate with your team seamlessly</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
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
              Welcome back
            </h2>
            <p className="text-gray-600">
              Sign in to continue to your dashboard
            </p>
          </div>
          
          <Card className="p-8 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<FiMail size={18} />}
                placeholder="you@example.com"
                required
              />
              <div>
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<FiLock size={18} />}
                  placeholder="Enter your password"
                  required
                />
                <div className="text-right mt-2">
                  <Link 
                    to="/forgot-password" 
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                loading={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/signup" className="text-primary-600 hover:text-primary-700 font-semibold">
                  Create account
                </Link>
              </p>
            </div>
          </Card>
          
          <p className="text-center text-xs text-gray-500 mt-6">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
