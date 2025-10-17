import { useState, useRef } from 'react';
import { registerStudent } from '../assets/services/api';
import { useToast } from '../contexts/ToastContext';

const RegisterStudentModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    father_name: '',
    mother_name: '',
    school: '',
    email_id: '',
    student_class: '',
    class_roll: '',
    gender: 'male',
    phone: '',
    entry_fee: '40',
    registered_by: null
  });
  const [phoneError, setPhoneError] = useState('');
  const phoneInputRef = useRef(null);
  const [schoolInputType, setSchoolInputType] = useState('select'); // 'select' or 'custom'
  const { success, error } = useToast();

  // Pre-set schools
  const presetSchools = [
    'আব্বাস আলী উচ্চ বিদ্যালয়',
    'রাজরাজেশ্বর ওমর আলী উচ্চ বিদ্যালয়',
    'চরভয়রা উচ্চ বিদ্যালয়',
    'চরকুমারিয়া উচ্চ বিদ্যালয়',
    'চরকুমারিয়া বালিকা উচ্চ বিদ্যালয়',
    'চরকুমারিয়া ইসলামিয়া ফাজিল মাদ্রাসা',
    'চরভাগা উচ্চ বিদ্যালয়',
    'কার্তিকপুর উচ্চ বিদ্যালয়',
    'দারুস সাহাবা দাখিল মাদ্রাসা',
    'মনোয়ারা শিকদার বালিকা উচ্চ বিদ্যালয়',
    'শহীদ বুদ্ধিজীবি ডা. হুমায়ুন কবির উচ্চ বিদ্যালয়',
    'উঃ তাঃ মহিউসসুন্নাহ ইসঃ দাঃ মাদ্রাসা',
    'এসইএসডিপি মডেল উচ্চ বিদ্যালয়',
    'সাজনপুর ইসলামিয়া উচ্চ বিদ্যালয়',
    'সাজনপুর বালিকা উচ্চ বিদ্যালয়',
    'দারুন নাজাত মাদ্রাসা কমপ্লেক্স',
    'চরচান্দ্রা উচ্চ বিদ্যালয়',
    'ভেদেরগঞ্জ হেটকোয়াটার সরকারি পাইলট উচ্চ বিদ্যালয়',
    'আসাদ পাবলিক স্কুল',
    'সখিপুর ইসলামিয়া উচ্চ বিদ্যালয়',
    'দুলারচর উচ্চ বিদ্যালয়',
    'বঙ্গবন্ধু উচ্চ বিদ্যালয়',
    'রামভদ্রপুর উচ্চ বিদ্যালয়',
    'ইউএস বাংলা ফাউন্ডেশন',
    'নারায়নপুর উচ্চ বিদ্যালয়',
    'প্যাসিফিক ল্যাবেটরি উচ্চ বিদ্যালয়',
    'চরফিলিজ জয়নব হাইস্কুল এন্ড কলেজ',
    'কিরণ নগর আদর্শ উচ্চ বিদ্যালয়',
    'ফয়জুন করিম মেমোরিয়াল একাডেমি স্কুল এন্ড কলেজ',
    'আঃ গণি হাই স্কুল',
    'সখিপুর সোলাইমানিয়া ইসলামিয়া দাঃ মাঃ',
    'দঃ সখিপুর মাধ্যমিক উচ্চ বিদ্যালয়'

  ];

  // Pre-set classes (restricted to 6–10)
  const presetClasses = ['6', '7', '8', '9', '10'];

  // Helper: Convert English digits to Bengali digits
  const toBengaliDigits = (value) => String(value).replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[d]);

  // Get admin ID from localStorage
  const getAdminId = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.id;
      } catch (err) {
        console.error('Error parsing token:', err);
        return null;
      }
    }
    return null;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (name === 'phone' && phoneError) {
      setPhoneError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation (Only required: name, school, class)
    if (!formData.name || !formData.school || !formData.student_class) {
      error('প্রয়োজনীয় তথ্য পূরণ করুন: নাম, স্কুল, শ্রেণী');
      return;
    }

    // Phone validation: optional; if provided, must be exactly 11 digits
    const trimmedPhone = (formData.phone || '').trim();
    if (trimmedPhone !== '' && !/^\d{11}$/.test(trimmedPhone)) {
      const msg = 'ফোন নম্বরে ভুল হয়েছে — ১১ সংখ্যার সঠিক নম্বর দিন (যেমন: 01XXXXXXXXX)।';
      setPhoneError(msg);
      error(msg);
      if (phoneInputRef.current) {
        phoneInputRef.current.focus();
      }
      return;
    } else if (trimmedPhone === '') {
      setPhoneError('');
    }

    // Ensure entry fee is a valid number, default to 40 if empty
    const entryFeeToSend = formData.entry_fee && /^\d+(\.\d{1,2})?$/.test(formData.entry_fee)
      ? formData.entry_fee
      : '40';

    try {
      setLoading(true);
      
      // Get admin ID from token
      const adminId = getAdminId();
      
      // Prepare data with admin ID; send null if phone is empty
      const trimmedPhoneForSend = (formData.phone || '').trim();
      const registrationData = {
        ...formData,
        phone: trimmedPhoneForSend !== '' ? trimmedPhoneForSend : null,
        entry_fee: entryFeeToSend,
        registered_by: adminId
      };
      
      const response = await registerStudent(registrationData);
      
      success('ছাত্র নিবন্ধন সফল হয়েছে!');
      onSuccess(response);
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        father_name: '',
        mother_name: '',
        school: '',
        email_id: '',
        student_class: '',
        class_roll: '',
        gender: 'male',
        phone: '',
        entry_fee: '40',
        registered_by: null
      });
      setPhoneError('');
      setSchoolInputType('select');
    } catch (err) {
      const msg = err?.error || err?.message || 'ছাত্র নিবন্ধন ব্যর্থ হয়েছে';
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      father_name: '',
      mother_name: '',
      school: '',
      email_id: '',
      student_class: '',
      class_roll: '',
      gender: 'male',
      phone: '',
      entry_fee: '40',
      registered_by: null
    });
    setSchoolInputType('select');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-xl border border-green-500/30 rounded-3xl shadow-2xl shadow-green-500/25 max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-b border-green-500/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                নতুন ছাত্র নিবন্ধন
              </h2>
              <p className="text-gray-600 text-sm mt-1" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                ছাত্রের তথ্য পূরণ করুন
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
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Personal Information */}
            <div className="bg-blue-50/50 border border-blue-200/50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                ব্যক্তিগত তথ্য
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    ছাত্রের নাম *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="ছাত্রের পূর্ণ নাম"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    পিতার নাম
                  </label>
                  <input
                    type="text"
                    name="father_name"
                    value={formData.father_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="পিতার নাম"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    মাতার নাম
                  </label>
                  <input
                    type="text"
                    name="mother_name"
                    value={formData.mother_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="মাতার নাম"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    লিঙ্গ
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="male">পুরুষ</option>
                    <option value="female">মহিলা</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="bg-green-50/50 border border-green-200/50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                শিক্ষাগত তথ্য
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    স্কুলের নাম *
                  </label>
                  
                  {/* School Input Type Toggle */}
                  <div className="flex space-x-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setSchoolInputType('select')}
                      className={`px-3 py-1 text-sm rounded-lg transition-all ${
                        schoolInputType === 'select'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
                    >
                      তালিকা থেকে নির্বাচন
                    </button>
                    <button
                      type="button"
                      onClick={() => setSchoolInputType('custom')}
                      className={`px-3 py-1 text-sm rounded-lg transition-all ${
                        schoolInputType === 'custom'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
                    >
                      নিজে লিখুন
                    </button>
                  </div>

                  {/* School Input Field */}
                  {schoolInputType === 'select' ? (
                    <select
                      name="school"
                      value={formData.school}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    >
                      <option value="">স্কুল নির্বাচন করুন</option>
                      {presetSchools.map((school, index) => (
                        <option key={index} value={school}>
                          {school}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      name="school"
                      value={formData.school}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="স্কুলের নাম লিখুন"
                      required
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    শ্রেণী *
                  </label>
                  <select
                    name="student_class"
                    value={formData.student_class}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="">শ্রেণী নির্বাচন করুন</option>
                    {presetClasses.map((cls) => (
                      <option key={cls} value={cls}>
                        {toBengaliDigits(cls)}ম শ্রেণী
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    শ্রেণীর রোল নম্বর
                  </label>
                  <input
                    type="text"
                    name="class_roll"
                    value={formData.class_roll}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="শ্রেণীর রোল নম্বর"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    ইমেইল
                  </label>
                  <input
                    type="email"
                    name="email_id"
                    value={formData.email_id}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="ইমেইল ঠিকানা"
                  />
                </div>
              </div>
            </div>

            {/* Contact & Payment Information */}
            <div className="bg-yellow-50/50 border border-yellow-200/50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                যোগাযোগ ও ফি তথ্য
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    ফোন নম্বর (ঐচ্ছিক)
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    ref={phoneInputRef}
                    aria-invalid={!!phoneError}
                    inputMode="numeric"
                    title="১১ সংখ্যার মোবাইল নম্বর দিন (যেমন: 01XXXXXXXXX)"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${phoneError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'}`}
                    placeholder="ফোন নম্বর (যেমন: 01XXXXXXXXX)"
                  />
                  {phoneError && (
                    <p className="mt-1 text-sm text-red-600" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                      {phoneError}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    প্রবেশ ফি (৳) *
                  </label>
                  <input
                    type="number"
                    name="entry_fee"
                    value={formData.entry_fee}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="প্রবেশ ফি"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>
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
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all font-medium shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
            >
              {loading ? 'নিবন্ধন হচ্ছে...' : 'নিবন্ধন করুন'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterStudentModal;
