import { useState, useEffect } from 'react';
import { editExam } from '../assets/services/api';
import { useToast } from '../contexts/ToastContext';

const EditExamModal = ({ isOpen, onClose, onSuccess, exam }) => {
  const [formData, setFormData] = useState({
    exam_name: '',
    question_count: '',
    year: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { success, error: showError } = useToast();

  useEffect(() => {
    if (exam) {
      setFormData({
        exam_name: exam.exam_name || '',
        question_count: exam.question_count || '',
        year: exam.year || ''
      });
    }
  }, [exam]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await editExam(exam.id, formData);
      success('Exam updated successfully');
      onSuccess();
      onClose();
    } catch (err) {
      const errorMessage = err.message || 'Failed to edit exam';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen || !exam) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/90 backdrop-blur-xl border border-green-500/30 rounded-3xl p-8 shadow-2xl shadow-green-500/25 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
            পরীক্ষা সম্পাদনা করুন
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              পরীক্ষার নাম
            </label>
            <input
              type="text"
              name="exam_name"
              value={formData.exam_name}
              onChange={handleChange}
              required
              placeholder="পরীক্ষার নাম লিখুন"
              className="w-full px-4 py-3 border border-green-500/30 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all"
              style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              প্রশ্ন সংখ্যা
            </label>
            <input
              type="number"
              name="question_count"
              value={formData.question_count}
              onChange={handleChange}
              required
              placeholder="প্রশ্ন সংখ্যা লিখুন"
              min="1"
              max="100"
              className="w-full px-4 py-3 border border-green-500/30 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all"
              style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              বছর
            </label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              required
              placeholder="2025"
              min="2020"
              max="2030"
              className="w-full px-4 py-3 border border-green-500/30 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all"
              style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-600 px-4 py-3 rounded-xl text-sm" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              {error}
            </div>
          )}

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
              style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/25"
              style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
            >
              {loading ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditExamModal;
