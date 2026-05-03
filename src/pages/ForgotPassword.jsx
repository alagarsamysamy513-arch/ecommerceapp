import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ShoppingBag, ArrowLeft, CheckCircle2 } from 'lucide-react';

const schema = yup.object({
  email: yup.string().email('Invalid email format').required('Email is required'),
}).required();

const shakeAnimation = {
  initial: { x: 0, opacity: 0 },
  animate: { x: [0, -10, 10, -10, 10, 0], opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0 }
};

export default function ForgotPassword() {
  const { resetPassword } = useAuthStore();
  const [emailSent, setEmailSent] = useState(false);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      await resetPassword(data.email);
      setEmailSent(true);
      toast.success('Reset link sent!');
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        toast.error('No account found with this email');
      } else {
        toast.error(error.message || 'Failed to send reset email');
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", duration: 0.4 }}
      className="bg-white w-full max-w-[420px] rounded-[20px] sm:shadow-lg sm:border sm:border-gray-100 overflow-hidden relative"
    >
      <Link to="/login" className="absolute top-6 left-6 p-2 text-gray-400 hover:text-[#1e3a8a] bg-gray-50 hover:bg-blue-50 rounded-full transition-colors z-10" aria-label="Back to login">
        <ArrowLeft className="w-5 h-5" />
      </Link>

      <div className="p-8 sm:p-10 pt-14">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-[#1e3a8a]/10 rounded-xl flex items-center justify-center mb-4">
            <ShoppingBag className="w-6 h-6 text-[#1e3a8a]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Forgot Password?</h2>
          <p className="mt-1 text-sm text-gray-500 font-medium text-center">
            No worries, we'll send you reset instructions.
          </p>
        </div>

        {emailSent ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Check your email</h3>
            <p className="text-gray-500 text-sm font-medium mb-8">
              We've sent a password reset link to your email address.
            </p>
            <Link 
              to="/login"
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#1e3a8a] hover:bg-[#2e4c9d] transition-all"
            >
              Back to log in
            </Link>
          </motion.div>
        ) : (
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

            <div className="pt-2">
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#1e3a8a] hover:bg-[#2e4c9d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e3a8a] disabled:opacity-50 transition-all"
              >
                {isSubmitting ? (
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : 'Send reset link'}
              </motion.button>
            </div>
          </form>
        )}
      </div>
    </motion.div>
  );
}
