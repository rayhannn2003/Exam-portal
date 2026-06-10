import { useState } from 'react';
import { loginStudent, loginAdmin } from '../assets/services/api';

const Login = ({ onClose, onSuccess }) => {
  const [userType, setUserType] = useState('student');
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!credentials.username.trim()) {
      newErrors.username = userType === 'student' ? 'রোল নম্বর প্রয়োজন' : 'ব্যবহারকারীর নাম প্রয়োজন';
    }
    if (!credentials.password.trim()) {
      newErrors.password = 'পাসওয়ার্ড প্রয়োজন';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      let response;
      let loginCredentials = { ...credentials };
      
      if (userType === 'student') {
        // For students, username field contains roll_number
        loginCredentials = {
          roll_number: credentials.username,
          password: credentials.password
        };
        response = await loginStudent(loginCredentials);
      } else {
        // For admins, username field contains username
        response = await loginAdmin(loginCredentials);
      }
      
      // Call success callback with response data
      if (onSuccess) {
        // Use the actual role from the response if available, otherwise fallback to userType
        const actualRole = response.admin?.role || userType;
        onSuccess(response, actualRole, credentials.username);
      }
      
      // Reset form
      setCredentials({
        username: '',
        password: ''
      });
      
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle specific error messages
      const errorMessage = error.error || error.message || 'লগইন ব্যর্থ হয়েছে! আবার চেষ্টা করুন।';
      setErrors({ general: errorMessage });
      
      // Show toast for error
      if (window.showToast) {
        window.showToast(errorMessage, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
      <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white drop-shadow-lg" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
            প্রবেশ করুন
          </h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-2xl font-bold transition-colors"
          >
            ×
          </button>
        </div>
        
        {errors.general && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-400/50 text-red-200 rounded-lg backdrop-blur-sm">
            {errors.general}
          </div>
        )}
        
        {/* User Type Selection */}
        <div className="mb-6">
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setUserType('student')}
              className={`px-4 py-2 rounded-lg font-medium transition-all backdrop-blur-sm ${
                userType === 'student'
                  ? 'bg-blue-500/80 text-white border border-blue-400/50'
                  : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/20'
              }`}
              style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
            >
              ছাত্র
            </button>
            <button
              type="button"
              onClick={() => setUserType('admin')}
              className={`px-4 py-2 rounded-lg font-medium transition-all backdrop-blur-sm ${
                userType === 'admin'
                  ? 'bg-blue-500/80 text-white border border-blue-400/50'
                  : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/20'
              }`}
              style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
            >
              অ্যাডমিন/সুপার অ্যাডমিন
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-white/90 font-medium mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              {userType === 'student' ? 'রোল নম্বর' : 'ব্যবহারকারীর নাম'}
            </label>
            <input
              type="text"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white/10 backdrop-blur-sm text-white placeholder-white/50 ${
                errors.username ? 'border-red-400' : 'border-white/30'
              }`}
              placeholder={userType === 'student' ? 'আপনার রোল নম্বর লিখুন' : 'আপনার ব্যবহারকারীর নাম লিখুন'}
            />
            {errors.username && <p className="text-red-300 text-sm mt-1">{errors.username}</p>}
          </div>
          
          <div className="mb-6">
            <label className="block text-white/90 font-medium mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              পাসওয়ার্ড
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={credentials.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white/10 backdrop-blur-sm text-white placeholder-white/50 ${
                  errors.password ? 'border-red-400' : 'border-white/30'
                }`}
                placeholder="আপনার পাসওয়ার্ড লিখুন"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.62 6.62m3.258 3.258l4.242 4.242M9.878 9.878V6.62m4.242 4.242L18.36 18.36M14.12 14.12v3.258" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <p className="text-red-300 text-sm mt-1">{errors.password}</p>}
          </div>
          
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-500/80 backdrop-blur-sm text-white font-bold py-3 rounded-lg hover:bg-blue-600/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-blue-400/50"
              style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
            >
              {isLoading ? 'প্রবেশ হচ্ছে...' : 'প্রবেশ করুন'}
            </button>
            
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-white/30 text-white/70 font-medium rounded-lg hover:bg-white/10 transition-colors backdrop-blur-sm"
              style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
            >
              বাতিল
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
