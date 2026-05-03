import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuthStore } from '../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ShoppingBag } from 'lucide-react';

const schema = yup.object({
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
}).required();

const shakeAnimation = {
  initial: { x: 0, opacity: 0 },
  animate: { x: [0, -10, 10, -10, 10, 0], opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0 }
};

export default function Login() {
  const { login, loginWithGoogle, loginWithFacebook } = useAuthStore();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      await login(data.email, data.password);
      toast.success('Successfully logged in!');
      navigate('/dashboard');
    } catch (error) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        toast.error('Invalid email or password');
      } else {
        toast.error(error.message || 'Failed to login');
      }
    }
  };

  const handleSocialLogin = async (provider) => {
    setIsSocialLoading(true);
    try {
      if (provider === 'google') await loginWithGoogle();
      if (provider === 'facebook') await loginWithFacebook();
      toast.success('Successfully logged in!');
      navigate('/dashboard');
    } catch (error) {
      if (error.code !== 'auth/popup-closed-by-user') {
        toast.error('Social login failed');
      }
    } finally {
      setIsSocialLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", duration: 0.4 }}
      className="bg-white w-full max-w-[420px] rounded-[20px] sm:shadow-lg sm:border sm:border-gray-100 overflow-hidden"
    >
      <div className="p-8 sm:p-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-[#1e3a8a]/10 rounded-xl flex items-center justify-center mb-4">
            <ShoppingBag className="w-6 h-6 text-[#1e3a8a]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">ShopNest</h2>
          <p className="mt-1 text-sm text-gray-500 font-medium text-center">
            Sign in to manage your store
          </p>
        </div>

        {/* Social Logins */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button 
            onClick={() => handleSocialLogin('google')}
            disabled={isSocialLoading}
            className="flex items-center justify-center w-full px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e3a8a]"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>
          <button 
            onClick={() => handleSocialLogin('facebook')}
            disabled={isSocialLoading}
            className="flex items-center justify-center w-full px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e3a8a]"
          >
            <svg className="w-5 h-5 mr-2 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Facebook
          </button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white text-gray-500 font-medium">or continue with email</span>
          </div>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('email')}
                type="email"
                placeholder="you@example.com"
                className={`appearance-none block w-full pl-10 pr-3 py-2.5 border ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#1e3a8a] focus:ring-[#1e3a8a]'} rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 sm:text-sm transition-colors`}
              />
            </div>
            <AnimatePresence>
              {errors.email && (
                <motion.p {...shakeAnimation} className="mt-1.5 text-xs text-red-600 font-medium">
                  {errors.email.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('password')}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={`appearance-none block w-full pl-10 pr-10 py-2.5 border ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#1e3a8a] focus:ring-[#1e3a8a]'} rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 sm:text-sm transition-colors`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <AnimatePresence>
              {errors.password && (
                <motion.p {...shakeAnimation} className="mt-1.5 text-xs text-red-600 font-medium">
                  {errors.password.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-[#1e3a8a] focus:ring-[#1e3a8a] border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2.5 block text-sm text-gray-700 font-medium">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link to="/forgot-password" className="font-semibold text-[#1e3a8a] hover:text-[#172554] transition-colors">
                Forgot password?
              </Link>
            </div>
          </div>

          <div className="pt-2">
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={isSubmitting || isSocialLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#1e3a8a] hover:bg-[#2e4c9d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e3a8a] disabled:opacity-50 transition-all"
            >
              {isSubmitting ? (
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : 'Sign in'}
            </motion.button>
          </div>
        </form>
        
        <div className="mt-8 text-center text-sm">
          <span className="text-gray-500 font-medium">Don't have an account? </span>
          <Link to="/register" className="font-semibold text-[#1e3a8a] hover:text-[#172554] transition-colors">
            Create one free
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
