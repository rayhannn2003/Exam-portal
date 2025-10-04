import { useToast } from '../contexts/ToastContext';

const QuestionPreviewModal = ({ isOpen, onClose, examSet }) => {
  const { success } = useToast();

  if (!isOpen || !examSet) return null;

  const questions = examSet.questions || [];
  const answerKey = examSet.answer_key || {};

  const getOptionStyle = (optionKey, questionNumber) => {
    const correctAnswer = answerKey[questionNumber?.toString()];
    if (correctAnswer === optionKey) {
      return 'bg-green-500/20 border-green-500 text-green-800 font-semibold';
    }
    return 'bg-white/60 border-gray-300 text-gray-700';
  };

  const getBengaliOption = (optionKey) => {
    const bengaliMap = {
      'A': 'ক',
      'B': 'খ',
      'C': 'গ',
      'D': 'ঘ'
    };
    return bengaliMap[optionKey] || optionKey;
  };

  const getOptionIcon = (optionKey, questionNumber) => {
    const correctAnswer = answerKey[questionNumber?.toString()];
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
        <span className="text-gray-600 text-sm font-medium">{getBengaliOption(optionKey)}</span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white/95 backdrop-blur-xl border border-green-500/30 rounded-2xl sm:rounded-3xl shadow-2xl shadow-green-500/25 max-w-6xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-b border-green-500/20 p-4 sm:p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-800 truncate" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                {examSet.class_name} - প্রশ্ন পর্যালোচনা
              </h2>
              <p className="text-gray-600 text-xs sm:text-sm mt-1" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                মোট {questions.length} টি প্রশ্ন - স্ক্রল করে সব প্রশ্ন দেখুন
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

        {/* Scrollable Questions Container */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-6 sm:space-y-8">
          {questions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-500/20 to-gray-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-600 text-2xl">❓</span>
              </div>
              <p className="text-gray-600" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                কোন প্রশ্ন নেই
              </p>
            </div>
          ) : (
            questions.map((question, index) => (
              <div key={question.qno || index} className="bg-white/80 backdrop-blur-sm border border-blue-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                {/* Question Header */}
                <div className="flex items-start space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0">
                    {question.qno}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 leading-relaxed" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                      {question.question}
                    </h3>
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                  {question.options && Object.entries(question.options).map(([optionKey, optionText]) => (
                    <div
                      key={optionKey}
                      className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-300 ${getOptionStyle(optionKey, question.qno)}`}
                    >
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        {getOptionIcon(optionKey, question.qno)}
                        <div className="flex-1 min-w-0">
                          <span className="text-sm sm:text-lg font-medium" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                            ({getBengaliOption(optionKey)}) {optionText}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                  {/*}
                {/* Answer Key Display */}
                {/* <div className="bg-green-500/10 border border-green-500/30 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-green-800 font-semibold text-sm sm:text-base" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                        সঠিক উত্তর: ({answerKey[question.qno?.toString()]})
                      </p>
                      <p className="text-green-700 text-xs sm:text-sm" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                        {question.options?.[answerKey[question.qno?.toString()]]}
                      </p>
                    </div>
                  </div>
                </div>  */}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50/80 border-t border-gray-200/50 p-3 sm:p-4 flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
            <div className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              মোট {questions.length} টি প্রশ্ন
            </div>
            <div className="flex space-x-2 sm:space-x-3">
              <button
                onClick={onClose}
                className="px-4 sm:px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium text-sm sm:text-base"
                style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
              >
                বন্ধ করুন
              </button>
              <button
                onClick={() => {
                  success('Question preview completed');
                  onClose();
                }}
                className="px-4 sm:px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all font-medium shadow-lg shadow-green-500/25 text-sm sm:text-base"
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