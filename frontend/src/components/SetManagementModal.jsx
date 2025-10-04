import { useState, useEffect } from 'react';
import { addExamClass, editExamClass, deleteExamClass } from '../assets/services/api';
import { useToast } from '../contexts/ToastContext';
import PDFGenerator from './PDFGenerator';

const SetManagementModal = ({ isOpen, onClose, onSuccess, exam, editingSet = null }) => {
  const [formData, setFormData] = useState({
    class_name: '',
    questions: [
      {
        qno: 1,
        question: '',
        options: { A: '', B: '', C: '', D: '' }
      }
    ],
    answer_key: {}
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [showPDFGenerator, setShowPDFGenerator] = useState(false);
  const [selectedSetForPDF, setSelectedSetForPDF] = useState(null);
  const { success, error: showError } = useToast();

  useEffect(() => {
    if (editingSet) {
      setFormData({
        class_name: editingSet.class_name || '',
        questions: editingSet.questions || [
          {
            qno: 1,
            question: '',
            options: { A: '', B: '', C: '', D: '' }
          }
        ],
        answer_key: editingSet.answer_key || {}
      });
    } else {
      setFormData({
        class_name: '',
        questions: [
          {
            qno: 1,
            question: '',
            options: { A: '', B: '', C: '', D: '' }
          }
        ],
        answer_key: {}
      });
    }
  }, [editingSet]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (editingSet) {
        await editExamClass(exam.id, editingSet.id, formData);
        success('Exam class updated successfully');
      } else {
        await addExamClass(exam.id, formData);
        success('Exam class added successfully');
      }
      onSuccess();
      onClose();
    } catch (err) {
      const errorMessage = err.message || 'Failed to save exam class';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editingSet) return;
    
    if (window.confirm('Are you sure you want to delete this exam class?')) {
      setLoading(true);
      try {
        await deleteExamClass(exam.id, editingSet.id);
        success('Exam class deleted successfully');
        onSuccess();
        onClose();
      } catch (err) {
        const errorMessage = err.message || 'Failed to delete exam class';
        setError(errorMessage);
        showError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  const addQuestion = () => {
    const newQuestion = {
      qno: formData.questions.length + 1,
      question: '',
      options: { A: '', B: '', C: '', D: '' }
    };
    setFormData({
      ...formData,
      questions: [...formData.questions, newQuestion]
    });
  };

  const removeQuestion = (index) => {
    if (formData.questions.length <= 1) {
      showError('At least one question is required');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this question?')) {
      const newQuestions = formData.questions.filter((_, i) => i !== index);
      // Renumber questions
      const renumberedQuestions = newQuestions.map((q, i) => ({
        ...q,
        qno: i + 1
      }));
      
      // Update answer key
      const newAnswerKey = {};
      renumberedQuestions.forEach((q, i) => {
        if (formData.answer_key[q.qno]) {
          newAnswerKey[i + 1] = formData.answer_key[q.qno];
        }
      });
      
      setFormData({
        ...formData,
        questions: renumberedQuestions,
        answer_key: newAnswerKey
      });
      
      success('Question deleted successfully');
    }
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[index] = {
      ...newQuestions[index],
      [field]: value
    };
    setFormData({
      ...formData,
      questions: newQuestions
    });
  };

  const updateOption = (questionIndex, option, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex].options[option] = value;
    setFormData({
      ...formData,
      questions: newQuestions
    });
  };

  const handleGeneratePDF = (set) => {
    setSelectedSetForPDF(set);
    setShowPDFGenerator(true);
  };

  const updateAnswerKey = (questionNo, answer) => {
    setFormData({
      ...formData,
      answer_key: {
        ...formData.answer_key,
        [questionNo]: answer
      }
    });
  };

  if (!isOpen || !exam) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/90 backdrop-blur-xl border border-green-500/30 rounded-3xl p-8 shadow-2xl shadow-green-500/25 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
            {editingSet ? 'ক্লাস সম্পাদনা করুন' : 'নতুন ক্লাস যোগ করুন'} - {exam.exam_name}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowJsonPreview(!showJsonPreview)}
              className="px-4 py-2 text-sm bg-blue-500/20 text-blue-600 rounded-lg hover:bg-blue-500/30 transition-all border border-blue-500/30"
              style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
            >
              {showJsonPreview ? 'ফর্ম দেখুন' : 'JSON দেখুন'}
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-red-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {showJsonPreview ? (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              JSON Preview
            </h3>
            <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                ক্লাসের নাম
              </label>
              <select
                value={formData.class_name}
                onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
                required
                className="w-full px-4 py-3 border border-green-500/30 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all"
                style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
              >
                <option value="">ক্লাস নির্বাচন করুন</option>
                <option value="6">৬ষ্ঠ শ্রেণী</option>
                <option value="7">৭ম শ্রেণী</option>
                <option value="8">৮ম শ্রেণী</option>
                <option value="9">৯ম শ্রেণী</option>
                <option value="10">১০ম শ্রেণী</option>
              </select>
            </div>

            {/* Existing Classes */}
            {!editingSet && exam.classes && exam.classes.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  বিদ্যমান ক্লাসসমূহ
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {exam.classes.map((set) => (
                    <div key={set.id} className="bg-white/60 backdrop-blur-sm border border-green-500/20 rounded-xl p-4 hover:shadow-lg hover:shadow-green-500/25 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-lg font-semibold text-gray-800" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                          {set.class_name}
                        </h4>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleGeneratePDF(set)}
                            className="text-green-600 hover:text-green-800 text-sm"
                            title="Generate Mock PDF"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              setEditingSet(set);
                              setFormData({
                                class_name: set.class_name || '',
                                questions: set.questions || [
                                  {
                                    qno: 1,
                                    question: '',
                                    options: { A: '', B: '', C: '', D: '' }
                                  }
                                ],
                                answer_key: set.answer_key || {}
                              });
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                            title="Edit Set"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={async () => {
                              if (window.confirm('Are you sure you want to delete this exam set?')) {
                                setLoading(true);
                                try {
                                  await deleteExamClass(exam.id, set.id);
                                  success('Exam class deleted successfully');
                                  onSuccess();
                                } catch (err) {
                                  const errorMessage = err.message || 'Failed to delete exam class';
                                  setError(errorMessage);
                                  showError(errorMessage);
                                } finally {
                                  setLoading(false);
                                }
                              }
                            }}
                            className="text-red-600 hover:text-red-800 text-sm"
                            title="Delete Set"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                        {set.questions ? set.questions.length : 0} টি প্রশ্ন
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  {editingSet ? 'প্রশ্নসমূহ সম্পাদনা করুন' : 'নতুন প্রশ্নসমূহ'}
                </h3>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="px-4 py-2 bg-green-500/20 text-green-600 rounded-lg hover:bg-green-500/30 transition-all border border-green-500/30"
                  style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
                >
                  + প্রশ্ন যোগ করুন
                </button>
              </div>

              <div className="space-y-6">
                {formData.questions.map((question, index) => (
                  <div key={index} className="bg-white/60 backdrop-blur-sm border border-green-500/20 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-semibold text-gray-800" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                        প্রশ্ন {question.qno}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeQuestion(index)}
                        className={`p-2 rounded-lg transition-all ${
                          formData.questions.length > 1 
                            ? 'text-red-500 hover:text-red-700 hover:bg-red-50 border border-red-200 hover:border-red-300' 
                            : 'text-gray-300 cursor-not-allowed border border-gray-200'
                        }`}
                        title={formData.questions.length > 1 ? 'Delete Question' : 'At least one question is required'}
                        disabled={formData.questions.length <= 1}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                          প্রশ্ন
                        </label>
                        <textarea
                          value={question.question}
                          onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                          required
                          placeholder="প্রশ্ন লিখুন..."
                          rows={3}
                          className="w-full px-4 py-3 border border-green-500/30 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all"
                          style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { key: 'A', bengali: 'ক' },
                          { key: 'B', bengali: 'খ' },
                          { key: 'C', bengali: 'গ' },
                          { key: 'D', bengali: 'ঘ' }
                        ].map((option) => (
                          <div key={option.key}>
                            <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                              অপশন {option.bengali}
                            </label>
                            <input
                              type="text"
                              value={question.options[option.key]}
                              onChange={(e) => updateOption(index, option.key, e.target.value)}
                              required
                              placeholder={`অপশন ${option.bengali}`}
                              className="w-full px-4 py-3 border border-green-500/30 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all"
                              style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
                            />
                          </div>
                        ))}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                          সঠিক উত্তর
                        </label>
                        <select
                          value={formData.answer_key[question.qno] || ''}
                          onChange={(e) => updateAnswerKey(question.qno, e.target.value)}
                          required
                          className="w-full px-4 py-3 border border-green-500/30 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all"
                          style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
                        >
                          <option value="">সঠিক উত্তর নির্বাচন করুন</option>
                          <option value="A">ক</option>
                          <option value="B">খ</option>
                          <option value="C">গ</option>
                          <option value="D">ঘ</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-600 px-4 py-3 rounded-xl text-sm" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                {error}
              </div>
            )}

            {/* Sticky Footer */}
            <div className="sticky bottom-0 bg-white/95 backdrop-blur-xl border-t border-green-500/30 -mx-8 px-8 py-4 mt-6">
              <div className="flex space-x-4">
                {editingSet && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={loading}
                    className="px-6 py-3 bg-red-500/20 text-red-600 rounded-xl hover:bg-red-500/30 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed border border-red-500/30"
                    style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
                  >
                    ক্লাস মুছুন
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
                  style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/25"
                  style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
                >
                  {loading ? 'সংরক্ষণ হচ্ছে...' : editingSet ? 'ক্লাস আপডেট করুন' : 'ক্লাস যোগ করুন'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* PDF Generator Modal */}
      {showPDFGenerator && selectedSetForPDF && (
        <PDFGenerator
          examId={exam.id}
          classId={selectedSetForPDF.id}
          examTitle={exam.exam_name}
          className={selectedSetForPDF.class_name}
          onClose={() => {
            setShowPDFGenerator(false);
            setSelectedSetForPDF(null);
          }}
        />
      )}
    </div>
  );
};

export default SetManagementModal;