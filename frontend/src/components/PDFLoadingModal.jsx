import { useEffect, useState } from 'react';

const PDFLoadingModal = ({ isOpen, onClose, title, message, type = 'question' }) => {
  const [dots, setDots] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    // Animated dots
    const dotsInterval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    // Simulated progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev;
        const increment = Math.random() * 15 + 5;
        return Math.min(prev + increment, 95);
      });
    }, 800);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(progressInterval);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setDots('');
      setProgress(0);
    }
  }, [isOpen]);

  // Icon based on PDF type
  const getIcon = () => {
    switch (type) {
      case 'scholarship':
        return '🎓';
      case 'admit':
        return '🎫';
      default:
        return '📄';
    }
  };

  // Color scheme based on PDF type
  const getColorScheme = () => {
    switch (type) {
      case 'scholarship':
        return {
          primary: 'from-purple-500 to-purple-600',
          secondary: 'bg-purple-100 border-purple-200',
          accent: 'text-purple-600'
        };
      case 'admit':
        return {
          primary: 'from-emerald-500 to-emerald-600',
          secondary: 'bg-emerald-100 border-emerald-200',
          accent: 'text-emerald-600'
        };
      default:
        return {
          primary: 'from-emerald-500 to-emerald-600',
          secondary: 'bg-blue-100 border-blue-200',
          accent: 'text-blue-600'
        };
    }
  };

  const colors = getColorScheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white/95 backdrop-blur-xl border border-gray-200 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all duration-300 scale-100">
        
        {/* Header with animated gradient */}
        <div className={`bg-gradient-to-r ${colors.primary} p-6 relative overflow-hidden`}>
          <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
          <div className="relative z-10 text-center">
            <div className="text-5xl mb-3 animate-bounce">
              {getIcon()}
            </div>
            <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              {title || 'PDF তৈরি হচ্ছে'}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Animated message */}
          <div className="text-center mb-6">
            <p className="text-gray-700 text-lg mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              {message || 'অনুগ্রহ করে অপেক্ষা করুন'}{dots}
            </p>
            <p className="text-gray-500 text-sm" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              PDF তৈরি হতে কয়েক মিনিট সময় লাগতে পারে
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              <span>অগ্রগতি</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${colors.primary} transition-all duration-1000 ease-out`}
                style={{ width: `${progress}%` }}
              >
                <div className="h-full w-full bg-white/30 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Status Steps */}
          <div className={`${colors.secondary} rounded-xl p-4`}>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${progress > 20 ? 'bg-green-500' : 'bg-gray-300'} animate-pulse`}></div>
                <span className="text-sm text-gray-600" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  ডেটা প্রস্তুত করা হচ্ছে
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${progress > 50 ? 'bg-green-500' : 'bg-gray-300'} animate-pulse`}></div>
                <span className="text-sm text-gray-600" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  টেমপ্লেট রেন্ডার করা হচ্ছে
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${progress > 80 ? 'bg-green-500' : 'bg-gray-300'} animate-pulse`}></div>
                <span className="text-sm text-gray-600" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  PDF জেনারেট করা হচ্ছে
                </span>
              </div>
            </div>
          </div>

          {/* Loading Animation */}
          <div className="flex justify-center mt-6">
            <div className="flex space-x-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full bg-gradient-to-r ${colors.primary} animate-bounce`}
                  style={{ animationDelay: `${i * 0.1}s` }}
                ></div>
              ))}
            </div>
          </div>

          {/* Warning Text */}
          <div className="mt-6 text-center">
            <p className="text-yellow-600 text-sm" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              ⚠️ অনুগ্রহ করে এই উইন্ডো বন্ধ করবেন না
            </p>
            <p className="text-gray-500 text-xs mt-1" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              PDF তৈরি সম্পন্ন হলে স্বয়ংক্রিয়ভাবে ডাউনলোড শুরু হবে
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFLoadingModal;
