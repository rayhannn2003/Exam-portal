import React from 'react';

const PDFLoadingModal = ({ isOpen, fileName = "PDF" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-xl border border-green-500/30 rounded-3xl p-8 shadow-2xl shadow-green-500/25 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-green-500/25 border border-green-500/30">
            <svg className="w-10 h-10 text-green-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
            PDF তৈরি হচ্ছে
          </h3>
          <p className="text-gray-600 text-sm" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
            অনুগ্রহ করে অপেক্ষা করুন...
          </p>
        </div>

        {/* Progress Animation */}
        <div className="space-y-6">
          {/* Animated Progress Bar */}
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 rounded-full animate-pulse relative overflow-hidden">
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full animate-shimmer"></div>
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              <span>0%</span>
              <span className="animate-pulse">প্রক্রিয়াকরণ...</span>
              <span>100%</span>
            </div>
          </div>

          {/* File Info */}
          <div className="bg-gray-50/80 border border-gray-200/50 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  {fileName}
                </p>
                <p className="text-xs text-gray-500" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  PDF ফাইল তৈরি হচ্ছে
                </p>
              </div>
            </div>
          </div>

          {/* Loading Steps */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm text-gray-700" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                ডেটা প্রস্তুত করা হচ্ছে
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center animate-spin">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <span className="text-sm text-gray-700" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                PDF তৈরি হচ্ছে
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3" />
                </svg>
              </div>
              <span className="text-sm text-gray-500" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                ডাউনলোড প্রস্তুত হচ্ছে
              </span>
            </div>
          </div>

          {/* Animated Dots */}
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>

        {/* Footer Message */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
            এটি কয়েক সেকেন্ড সময় নিতে পারে
          </p>
        </div>
      </div>
    </div>
  );
};

export default PDFLoadingModal;

