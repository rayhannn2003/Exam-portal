import { useState, useEffect } from 'react';
import { updateStudent } from '../assets/services/api';
import { useToast } from '../contexts/ToastContext';

const EditStudentModal = ({ isOpen, onClose, student, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    father_name: '',
    mother_name: '',
    school: '',
    email_id: '',
    class_roll: '',
    gender: 'male',
    payment_status: false,
    entry_fee: ''
  });
  const [loading, setLoading] = useState(false);
  const [schoolInputType, setSchoolInputType] = useState('select'); // 'select' or 'custom'
  const { success, error } = useToast();

  // Pre-set schools (same as RegisterStudentModal)
  const presetSchools = [
    'আব্বাস আলী উচ্চ বিদ্যালয়',
    'রাজরাজেশ্বর ওমর আলী উচ্চ বিদ্যালয়',
    'চরভয়রা উচ্চ বিদ্যালয়',
    'চরকুমারিয়া উচ্চ বিদ্যালয়',
    'চরকুমারিয়া বালিকা উচ্চ বিদ্যালয়',
    'চরকুমারিয়া ইসলামিয়া ফাজিল মাদ্রাসা',
    'চরভাগা উচ্চ বিদ্যালয়',
    'কার্তিকপুর উচ্চ বিদ্যালয়',
    'দারুস সাহাবা দাখিল মাদ্রাসা',
    'মনোয়ারা শিকদার বালিকা উচ্চ বিদ্যালয়',
    'শহীদ বুদ্ধিজীবি ডা. হুমায়ুন কবির উচ্চ বিদ্যালয়',
    'উঃ তাঃ মহিউসসুন্নাহ ইসঃ দাঃ মাদ্রাসা',
    'এসইএসডিপি মডেল উচ্চ বিদ্যালয়',
    'সাজনপুর ইসলামিয়া উচ্চ বিদ্যালয়',
    'সাজনপুর বালিকা উচ্চ বিদ্যালয়',
    'দারুন নাজাত মাদ্রাসা কমপ্লেক্স',
    'চরচান্দ্রা উচ্চ বিদ্যালয়',
    'ভেদেরগঞ্জ হেটকোয়াটার সরকারি পাইলট উচ্চ বিদ্যালয়',
    'আসাদ পাবলিক স্কুল',
    'সখিপুর ইসলামিয়া উচ্চ বিদ্যালয়',
    'দুলারচর উচ্চ বিদ্যালয়',
    'বঙ্গবন্ধু উচ্চ বিদ্যালয়',
    'রামভদ্রপুর উচ্চ বিদ্যালয়',
    'ইউরো বাংলা ফাউন্ডেশন',
    'নারায়নপুর উচ্চ বিদ্যালয়',
    'প্যাসিফিক ল্যাবেটরি উচ্চ বিদ্যালয়',
    'চরফিলিজ জয়নব হাইস্কুল এন্ড কলেজ',
    'কিরণ নগর আদর্শ উচ্চ বিদ্যালয়',
    'ফয়জুন করিম মেমোরিয়াল একাডেমি স্কুল এন্ড কলেজ',
    'আঃ গণি হাই স্কুল',
    'সখিপুর সোলাইমানিয়া ইসলামিয়া দাঃ মাঃ',
    'দঃ সখিপুর মাধ্যমিক উচ্চ বিদ্যালয়'
  ];

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || '',
        father_name: student.father_name || '',
        mother_name: student.mother_name || '',
        school: student.school || '',
        email_id: student.email_id || '',
        class_roll: student.class_roll || '',
        gender: student.gender || 'male',
        payment_status: student.payment_status || false,
        entry_fee: student.entry_fee || ''
      });
      
      // Set school input type based on whether the school is in preset list
      if (student.school && presetSchools.includes(student.school)) {
        setSchoolInputType('select');
      } else {
        setSchoolInputType('custom');
      }
    }
  }, [student]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!student?.id) return;

    setLoading(true);
    try {
      const updateData = { ...formData };
      // Convert entry_fee to number if it's provided
      if (updateData.entry_fee !== '') {
        updateData.entry_fee = Number(updateData.entry_fee);
      }

      await updateStudent(student.id, updateData);
      success('ছাত্রের তথ্য সফলভাবে আপডেট হয়েছে');
      onSuccess();
      onClose();
    } catch (err) {
      error('ছাত্রের তথ্য আপডেট করতে ব্যর্থ');
      console.error('Update error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-xl border border-green-500/30 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-green-500/20">
          <h3 className="text-xl font-bold text-gray-800" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
            ছাত্রের তথ্য সম্পাদনা
          </h3>
          <p className="text-gray-600 text-sm mt-1" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
            রোল নম্বর: {student?.roll_number}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Information */}
          <div className="bg-blue-50/50 border border-blue-200/50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              ব্যক্তিগত তথ্য
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  ছাত্রের নাম <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
                  placeholder="ছাত্রের সম্পূর্ণ নাম লিখুন"
                />
              </div>

              {/* Father's Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  পিতার নাম
                </label>
                <input
                  type="text"
                  name="father_name"
                  value={formData.father_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
                  placeholder="পিতার নাম"
                />
              </div>

              {/* Mother's Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  মাতার নাম
                </label>
                <input
                  type="text"
                  name="mother_name"
                  value={formData.mother_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
                  placeholder="মাতার নাম"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  লিঙ্গ <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
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
              {/* School */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  স্কুলের নাম <span className="text-red-500">*</span>
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
                    onChange={handleChange}
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
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
                    placeholder="স্কুলের নাম লিখুন"
                    required
                  />
                )}
              </div>

              {/* Class Roll */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  শ্রেণির রোল নম্বর
                </label>
                <input
                  type="text"
                  name="class_roll"
                  value={formData.class_roll}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
                  placeholder="শ্রেণির রোল নম্বর"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  ইমেইল ঠিকানা
                </label>
                <input
                  type="email"
                  name="email_id"
                  value={formData.email_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="example@email.com"
                />
              </div>

              {/* Entry Fee */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  প্রবেশ ফি (টাকা)
                </label>
                <input
                  type="number"
                  name="entry_fee"
                  value={formData.entry_fee}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="০"
                />
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className="bg-yellow-50/50 border border-yellow-200/50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              পেমেন্ট তথ্য
            </h3>
            
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="payment_status"
                  checked={formData.payment_status}
                  onChange={handleChange}
                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                />
                <span className="text-sm font-medium text-gray-700" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  পেমেন্ট সম্পন্ন হয়েছে
                </span>
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
            >
              {loading ? 'আপডেট হচ্ছে...' : 'আপডেট করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStudentModal;