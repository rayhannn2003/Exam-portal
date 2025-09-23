import { useState } from 'react';
import { registerStudent } from '../assets/services/api';

const Registration = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    father_name: '',
    mother_name: '',
    school: '',
    student_class: '',
    class_roll: '',
    email_id: '',
    gender: '',
    phone: '',
    entry_fee: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
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
    
    if (!formData.name.trim()) newErrors.name = 'নাম প্রয়োজন';
    if (!formData.school.trim()) newErrors.school = 'স্কুল/কলেজ প্রয়োজন';
    if (!formData.student_class) newErrors.student_class = 'শ্রেণী নির্বাচন করুন';
    if (!formData.phone.trim()) newErrors.phone = 'ফোন নম্বর প্রয়োজন';
    if (!formData.gender) newErrors.gender = 'লিঙ্গ নির্বাচন করুন';
    if (!formData.entry_fee || parseFloat(formData.entry_fee) <= 0) {
      newErrors.entry_fee = 'ভর্তি ফি প্রয়োজন';
    }
    
    // Email validation (optional field)
    if (formData.email_id && !/\S+@\S+\.\S+/.test(formData.email_id)) {
      newErrors.email_id = 'সঠিক ইমেইল ঠিকানা লিখুন';
    }
    
    // Phone validation
    if (formData.phone && !/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = 'সঠিক ফোন নম্বর লিখুন';
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
      const registrationData = {
        ...formData,
        entry_fee: parseFloat(formData.entry_fee)
      };

      const response = await registerStudent(registrationData);
      
      // Call success callback with response data
      if (onSuccess) {
        onSuccess(response);
      }
      
      // Reset form
      setFormData({
        name: '',
        father_name: '',
        mother_name: '',
        school: '',
        student_class: '',
        class_roll: '',
        email_id: '',
        gender: '',
        phone: '',
        entry_fee: ''
      });
      
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle specific error messages
      const errorMessage = error.error || error.message || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে! আবার চেষ্টা করুন।';
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
      <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white drop-shadow-lg" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
            ছাত্র নিবন্ধন
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
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-white/90 font-medium mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                নাম *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 bg-white/10 backdrop-blur-sm text-white placeholder-white/50 ${
                  errors.name ? 'border-red-400' : 'border-white/30'
                }`}
                placeholder="আপনার পূর্ণ নাম লিখুন"
              />
              {errors.name && <p className="text-red-300 text-sm mt-1">{errors.name}</p>}
            </div>
            
            <div>
              <label className="block text-white/90 font-medium mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                পিতার নাম
              </label>
              <input
                type="text"
                name="father_name"
                value={formData.father_name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-white/30 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 bg-white/10 backdrop-blur-sm text-white placeholder-white/50"
                placeholder="আপনার পিতার নাম"
              />
            </div>
            
            <div>
              <label className="block text-white/90 font-medium mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                মাতার নাম
              </label>
              <input
                type="text"
                name="mother_name"
                value={formData.mother_name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-white/30 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 bg-white/10 backdrop-blur-sm text-white placeholder-white/50"
                placeholder="আপনার মাতার নাম"
              />
            </div>
            
            <div>
              <label className="block text-white/90 font-medium mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                স্কুল/কলেজ *
              </label>
              <input
                type="text"
                name="school"
                value={formData.school}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 bg-white/10 backdrop-blur-sm text-white placeholder-white/50 ${
                  errors.school ? 'border-red-400' : 'border-white/30'
                }`}
                placeholder="আপনার শিক্ষা প্রতিষ্ঠানের নাম"
              />
              {errors.school && <p className="text-red-300 text-sm mt-1">{errors.school}</p>}
            </div>
            
            <div>
              <label className="block text-white/90 font-medium mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                শ্রেণী *
              </label>
              <select
                name="student_class"
                value={formData.student_class}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 bg-white/10 backdrop-blur-sm text-white ${
                  errors.student_class ? 'border-red-400' : 'border-white/30'
                }`}
              >
                <option value="" className="bg-gray-800 text-white">শ্রেণী নির্বাচন করুন</option>
                <option value="6" className="bg-gray-800 text-white">ষষ্ঠ</option>
                <option value="7" className="bg-gray-800 text-white">সপ্তম</option>
                <option value="8" className="bg-gray-800 text-white">অষ্টম</option>
                <option value="9" className="bg-gray-800 text-white">নবম</option>
                <option value="10" className="bg-gray-800 text-white">দশম</option>
                <option value="11" className="bg-gray-800 text-white">একাদশ</option>
                <option value="12" className="bg-gray-800 text-white">দ্বাদশ</option>
              </select>
              {errors.student_class && <p className="text-red-300 text-sm mt-1">{errors.student_class}</p>}
            </div>
            
            <div>
              <label className="block text-white/90 font-medium mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                ক্লাস রোল
              </label>
              <input
                type="number"
                name="class_roll"
                value={formData.class_roll}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-white/30 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 bg-white/10 backdrop-blur-sm text-white placeholder-white/50"
                placeholder="আপনার ক্লাস রোল"
              />
            </div>
            
            <div>
              <label className="block text-white/90 font-medium mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                ইমেইল
              </label>
              <input
                type="email"
                name="email_id"
                value={formData.email_id}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 bg-white/10 backdrop-blur-sm text-white placeholder-white/50 ${
                  errors.email_id ? 'border-red-400' : 'border-white/30'
                }`}
                placeholder="আপনার ইমেইল ঠিকানা"
              />
              {errors.email_id && <p className="text-red-300 text-sm mt-1">{errors.email_id}</p>}
            </div>
            
            <div>
              <label className="block text-white/90 font-medium mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                লিঙ্গ *
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 bg-white/10 backdrop-blur-sm text-white ${
                  errors.gender ? 'border-red-400' : 'border-white/30'
                }`}
              >
                <option value="" className="bg-gray-800 text-white">লিঙ্গ নির্বাচন করুন</option>
                <option value="male" className="bg-gray-800 text-white">পুরুষ</option>
                <option value="female" className="bg-gray-800 text-white">মহিলা</option>
                <option value="other" className="bg-gray-800 text-white">অন্যান্য</option>
              </select>
              {errors.gender && <p className="text-red-300 text-sm mt-1">{errors.gender}</p>}
            </div>
            
            <div>
              <label className="block text-white/90 font-medium mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                ফোন নম্বর *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 bg-white/10 backdrop-blur-sm text-white placeholder-white/50 ${
                  errors.phone ? 'border-red-400' : 'border-white/30'
                }`}
                placeholder="আপনার ফোন নম্বর"
              />
              {errors.phone && <p className="text-red-300 text-sm mt-1">{errors.phone}</p>}
            </div>
            
            <div>
              <label className="block text-white/90 font-medium mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                ভর্তি ফি *
              </label>
              <input
                type="number"
                name="entry_fee"
                value={formData.entry_fee}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 bg-white/10 backdrop-blur-sm text-white placeholder-white/50 ${
                  errors.entry_fee ? 'border-red-400' : 'border-white/30'
                }`}
                placeholder="ভর্তি ফি (টাকা)"
              />
              {errors.entry_fee && <p className="text-red-300 text-sm mt-1">{errors.entry_fee}</p>}
            </div>
          </div>
          
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-green-500/80 backdrop-blur-sm text-white font-bold py-3 rounded-lg hover:bg-green-600/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-green-400/50"
              style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
            >
              {isLoading ? 'নিবন্ধন হচ্ছে...' : 'নিবন্ধন সম্পূর্ণ করুন'}
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

export default Registration;
