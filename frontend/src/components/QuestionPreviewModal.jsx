import { useState } from 'react';
import { useToast } from '../contexts/ToastContext';

const QuestionPreviewModal = ({ isOpen, onClose, examSet }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const { success } = useToast();

  if (!isOpen || !examSet) return null;

  const questions = examSet.questions || [];
  const answerKey = examSet.answer_key || {};
  const currentQuestion = questions[currentQuestionIndex];

  const getOptionStyle = (optionKey) => {
    const correctAnswer = answerKey[currentQuestion?.qno?.toString()];
    if (correctAnswer === optionKey) {
      return 'bg-green-500/20 border-green-500 text-green-800 font-semibold';
    }
    return 'bg-white/60 border-gray-300 text-gray-700';
  };

  const getOptionIcon = (optionKey) => {
    const correctAnswer = answerKey[currentQuestion?.qno?.toString()];
    if (correctAnswer === optionKey) {
      return (
        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      );
    }
    return (
      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
        <span className="text-gray-600 text-sm font-medium">{optionKey}</span>
      </div>
    );
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-xl border border-green-500/30 rounded-3xl shadow-2xl shadow-green-500/25 max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-b border-green-500/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                {examSet.set_name} - প্রশ্ন পর্যালোচনা
              </h2>
              <p className="text-gray-600 text-sm mt-1" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                মোট {questions.length} টি প্রশ্ন
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-white/50 rounded-full"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Question Navigation */}
        <div className="bg-white/80 border-b border-gray-200/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={prevQuestion}
                disabled={currentQuestionIndex === 0}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-sm font-medium text-gray-600" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                {currentQuestionIndex + 1} / {questions.length}
              </span>
              <button
                onClick={nextQuestion}
                disabled={currentQuestionIndex === questions.length - 1}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Question Dots */}
            <div className="flex space-x-2">
              {questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToQuestion(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentQuestionIndex
                      ? 'bg-green-500 scale-125'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Question Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {currentQuestion ? (
            <div className="space-y-6">
              {/* Question Number and Text */}
              <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-2xl p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {currentQuestion.qno}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 leading-relaxed" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                      {currentQuestion.question}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {Object.entries(currentQuestion.options || {}).map(([optionKey, optionText]) => (
                  <div
                    key={optionKey}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${getOptionStyle(optionKey)}`}
                  >
                    <div className="flex items-center space-x-4">
                      {getOptionIcon(optionKey)}
                      <div className="flex-1">
                        <span className="text-lg font-medium" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                          ({optionKey}) {optionText}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Answer Key Display */}
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-green-800 font-semibold" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                      সঠিক উত্তর: ({answerKey[currentQuestion.qno?.toString()]})
                    </p>
                    <p className="text-green-700 text-sm" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                      {currentQuestion.options?.[answerKey[currentQuestion.qno?.toString()]]}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-400 text-2xl">❓</span>
              </div>
              <p className="text-gray-600" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                কোন প্রশ্ন পাওয়া যায়নি
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50/80 border-t border-gray-200/50 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              প্রশ্ন {currentQuestionIndex + 1} / {questions.length}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
                style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
              >
                বন্ধ করুন
              </button>
              <button
                onClick={() => {
                  success('Question preview completed');
                  onClose();
                }}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all font-medium shadow-lg shadow-green-500/25"
                style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
              >
                সম্পন্ন
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionPreviewModal;
