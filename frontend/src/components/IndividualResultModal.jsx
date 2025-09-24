import { useToast } from '../contexts/ToastContext';

const IndividualResultModal = ({ isOpen, onClose, resultData }) => {
  const { success } = useToast();

  if (!isOpen || !resultData || resultData.length === 0) return null;

  const result = resultData[0]; // Get the first (and likely only) result
  const studentAnswers = result.student_answered || {};
  const correctAnswers = result.correct_answers || {};

  const getGradeColor = (percentage) => {
    const percent = parseFloat(percentage);
    if (percent >= 80) return 'text-green-600 bg-green-100 border-green-300';
    if (percent >= 60) return 'text-blue-600 bg-blue-100 border-blue-300';
    if (percent >= 40) return 'text-yellow-600 bg-yellow-100 border-yellow-300';
    return 'text-red-600 bg-red-100 border-red-300';
  };

  const getGradeText = (percentage) => {
    const percent = parseFloat(percentage);
    if (percent >= 80) return 'A+';
    if (percent >= 70) return 'A';
    if (percent >= 60) return 'A-';
    if (percent >= 50) return 'B';
    if (percent >= 40) return 'C';
    return 'F';
  };

  const getQuestionStatus = (questionNumber) => {
    const studentAnswer = studentAnswers[questionNumber];
    const correctAnswer = correctAnswers[questionNumber];
    
    if (!studentAnswer || studentAnswer === '') {
      return { 
        status: 'skipped', 
        color: 'text-gray-600 bg-gray-100 border-gray-300', 
        icon: '⏭️',
        text: 'Skipped',
        textColor: 'text-gray-600'
      };
    }
    
    if (studentAnswer === correctAnswer) {
      return { 
        status: 'correct', 
        color: 'text-green-600 bg-green-100 border-green-300', 
        icon: '✅',
        text: 'Correct',
        textColor: 'text-green-600'
      };
    } else {
      return { 
        status: 'incorrect', 
        color: 'text-red-600 bg-red-100 border-red-300', 
        icon: '❌',
        text: 'Incorrect',
        textColor: 'text-red-600'
      };
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white/95 backdrop-blur-xl border border-green-500/30 rounded-2xl sm:rounded-3xl shadow-2xl shadow-green-500/25 max-w-6xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-b border-green-500/20 p-4 sm:p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-800 truncate" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                {result.name} - বিস্তারিত ফলাফল
              </h2>
              <p className="text-gray-600 text-xs sm:text-sm mt-1" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                রোল নম্বর: {result.roll_number} | {result.school} | শ্রেণী {result.class}
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-6">
          {/* Student Info Card */}
          <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    👤
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                      {result.name}
                    </h3>
                    <p className="text-gray-600 text-sm" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                      রোল নম্বর: {result.roll_number}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600 text-sm" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>স্কুল:</span>
                    <span className="text-gray-800 font-medium" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>{result.school}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600 text-sm" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>শ্রেণী:</span>
                    <span className="text-gray-800 font-medium">শ্রেণী {result.class}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    📝
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                      {result.title}
                    </h3>
                    <p className="text-gray-600 text-sm">বছর: {result.year}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600 text-sm" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>মূল্যায়ন তারিখ:</span>
                    <span className="text-gray-800 font-medium">
                      {new Date(result.evaluated_at).toLocaleDateString('bn-BD')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white/80 backdrop-blur-sm border border-green-500/20 rounded-xl p-3 sm:p-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">
                {result.correct}
              </div>
              <div className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                সঠিক উত্তর
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm border border-red-500/20 rounded-xl p-3 sm:p-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-1">
                {result.wrong}
              </div>
              <div className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                ভুল উত্তর
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm border border-blue-500/20 rounded-xl p-3 sm:p-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">
                {result.score}
              </div>
              <div className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                স্কোর
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm border border-purple-500/20 rounded-xl p-3 sm:p-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-1">
                {result.percentage}%
              </div>
              <div className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                শতাংশ
              </div>
            </div>
          </div>

          {/* Grade Display */}
          <div className="text-center">
            <div className={`inline-flex items-center px-6 py-3 rounded-xl border-2 ${getGradeColor(result.percentage)}`}>
              <span className="text-2xl sm:text-3xl font-bold mr-2">
                {getGradeText(result.percentage)}
              </span>
              <span className="text-sm sm:text-base" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                গ্রেড
              </span>
            </div>
          </div>

          {/* Question Analysis */}
          <div className="bg-white/80 backdrop-blur-sm border border-gray-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              প্রশ্নভিত্তিক বিশ্লেষণ
            </h3>
            
            <div className="space-y-6">
              {result.question_set && result.question_set.map((question) => {
                const questionNumber = question.qno.toString();
                const studentAnswer = studentAnswers[questionNumber];
                const correctAnswer = correctAnswers[questionNumber];
                const questionStatus = getQuestionStatus(questionNumber);
                
                return (
                  <div
                    key={questionNumber}
                    className="bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {/* Question Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-lg sm:text-xl font-bold text-gray-800">
                            {questionNumber}.
                          </span>
                          <span className="text-sm sm:text-base font-medium text-gray-600" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                            {question.question}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <span className="text-lg">{questionStatus.icon}</span>
                        <span className={`text-xs sm:text-sm font-bold ${questionStatus.textColor}`}>
                          {questionStatus.text}
                        </span>
                      </div>
                    </div>
                    
                    {/* Options */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4">
                      {Object.entries(question.options).map(([optionKey, optionText]) => {
                        let optionClass = 'bg-white/80 border border-gray-300 text-gray-700';
                        
                        // Mark correct answer
                        if (optionKey === correctAnswer) {
                          optionClass = 'bg-green-100 border-green-500 text-green-800 font-semibold';
                        }
                        
                        // Mark student's answer
                        if (studentAnswer && optionKey === studentAnswer) {
                          if (studentAnswer === correctAnswer) {
                            optionClass = 'bg-green-200 border-green-600 text-green-900 font-bold';
                          } else {
                            optionClass = 'bg-red-100 border-red-500 text-red-800 font-semibold';
                          }
                        }
                        
                        return (
                          <div
                            key={optionKey}
                            className={`p-2 sm:p-3 rounded-lg border-2 transition-all duration-300 ${optionClass}`}
                          >
                            <span className="text-sm sm:text-base font-medium">
                              ({optionKey}) {optionText}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Correct Answer Display */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-blue-600 font-semibold text-sm sm:text-base" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                          সঠিক উত্তর:
                        </span>
                        <span className="text-blue-800 font-bold text-sm sm:text-base">
                          ({correctAnswer}) {question.options[correctAnswer]}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Answer Key Reference */}
          {/* <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              উত্তর কী রেফারেন্স
            </h3>
            
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {Object.entries(correctAnswers).map(([questionNumber, answer]) => (
                <div
                  key={questionNumber}
                  className="text-center p-2 bg-white/60 rounded-lg border border-yellow-500/30"
                >
                  <div className="text-xs sm:text-sm font-bold text-gray-800 mb-1">
                    {questionNumber}
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-yellow-600">
                    {answer}
                  </div>
                </div>
              ))}
            </div>
          </div> */}
        </div>

        {/* Footer */}
        <div className="bg-gray-50/80 border-t border-gray-200/50 p-3 sm:p-4 flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
            <div className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              মোট প্রশ্ন: {result.total_questions} | সঠিক: {result.correct} | ভুল: {result.wrong}
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
                  success('Result analysis completed');
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

export default IndividualResultModal;
