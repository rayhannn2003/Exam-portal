import { useState, useEffect } from 'react';
import { updateAdmin } from '../assets/services/api';
import { useToast } from '../contexts/ToastContext';

const EditAdminModal = ({ isOpen, onClose, onSuccess, admin }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    password: '',
    role: 'admin'
  });
  const [showPassword, setShowPassword] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    if (admin) {
      setFormData({
        username: admin.username || '',
        name: admin.name || '',
        password: '',
        role: admin.role || 'admin'
      });
    }
  }, [admin]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.username || !formData.name) {
      error('Please fill in all required fields');
      return;
    }

    if (formData.password && formData.password.length < 3) {
      error('Password must be at least 3 characters long');
      return;
    }

    try {
      setLoading(true);
      
      // Only include password if it's provided
      const updateData = {
        username: formData.username,
        name: formData.name,
        role: formData.role
      };
      
      if (formData.password) {
        updateData.password = formData.password;
      }
      
      const response = await updateAdmin(admin.id, updateData);
      
      success('Admin updated successfully!');
      onSuccess(response);
      onClose();
      
      // Reset form
      setFormData({
        username: '',
        name: '',
        password: '',
        role: 'admin'
      });
    } catch (err) {
      error(err.message || 'Failed to update admin');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      username: '',
      name: '',
      password: '',
      role: 'admin'
    });
    onClose();
  };

  if (!isOpen || !admin) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-xl border border-blue-500/30 rounded-3xl shadow-2xl shadow-blue-500/25 max-w-lg w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-b border-blue-500/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                অ্যাডমিন সম্পাদনা করুন
              </h2>
              <p className="text-gray-600 text-sm mt-1" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                অ্যাডমিনের তথ্য আপডেট করুন
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-white/50 rounded-full"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                ব্যবহারকারীর নাম *
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ব্যবহারকারীর নাম"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                পূর্ণ নাম *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="পূর্ণ নাম"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                নতুন পাসওয়ার্ড (ঐচ্ছিক)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="নতুন পাসওয়ার্ড (শূন্য রাখলে পরিবর্তন হবে না)"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
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
              <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                পাসওয়ার্ড পরিবর্তন করতে চাইলে নতুন পাসওয়ার্ড লিখুন
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                ভূমিকা
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="admin">অ্যাডমিন</option>
              
              </select>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-gray-50/80 border-t border-gray-200/50 p-6">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
              style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
            >
              বাতিল
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all font-medium shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
            >
              {loading ? 'আপডেট হচ্ছে...' : 'আপডেট করুন'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditAdminModal;
