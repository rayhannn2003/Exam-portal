import React, { useState } from 'react';
import { useToast } from '../contexts/ToastContext';
import { previewExamClassPDF, downloadExamClassPDF } from '../assets/services/api';
import PDFLoadingModal from './PDFLoadingModal';

const PDFGenerator = ({ examId, classId, examTitle, className, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const { success, error: showError } = useToast();

  const handleDownloadPDF = async () => {
    setLoading(true);
    setShowLoadingModal(true);
    
    try {
      const blob = await downloadExamClassPDF(examId, classId, { 
        templateType: 'compact_bengali',
        customization: {
          organization_name: 'উত্তর তারাবুনিয়া ছাত্রকল্যাণ সংগঠন',
          duration_minutes: 60,
          show_instructions: false
        }
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // Create safe filename without Bengali characters - use transliteration
      const safeExamTitle = (examTitle || 'Bengali_Exam').replace(/[^\x00-\x7F]/g, '').trim() || 'Exam';
      const safeClassName = (className || 'Class').replace(/[^\x00-\x7F]/g, '').trim() || 'Class';
      a.download = `${safeExamTitle}_${safeClassName}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      window.URL.revokeObjectURL(url);
      
      success('PDF প্রশ্নপত্র সফলভাবে ডাউনলোড হয়েছে!');
      onClose();
    } catch (err) {
      console.error('PDF generation error:', err);
      showError('PDF তৈরি করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
      setShowLoadingModal(false);
    }
  };

  const handlePreview = async () => {
    setLoading(true);
    try {
      const html = await previewExamClassPDF(examId, classId, { 
        templateType: 'compact_bengali',
        customization: {
          organization_name: 'উত্তর তারাবুনিয়া ছাত্রকল্যাণ সংগঠন',
          duration_minutes: 60,
          show_instructions: false
        }
      });
      
      const newWindow = window.open('', '_blank');
      newWindow.document.write(html);
      newWindow.document.close();
      success('প্রিভিউ নতুন উইন্ডোতে খুলেছে');
    } catch (err) {
      console.error('Preview error:', err);
      showError('প্রিভিউ দেখাতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
            বাংলা প্রশ্নপত্র তৈরি করুন
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Real Data Information */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
            প্রশ্নপত্রের তথ্য
          </h3>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              <strong>শিরোনাম:</strong> {examTitle || 'পরীক্ষা'}
            </p>
            <p style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              <strong>সংগঠন:</strong> উত্তর তারাবুনিয়া ছাত্রকল্যাণ সংগঠন
            </p>
            <p style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              <strong>ক্লাস:</strong> {className || 'ক্লাস'}
            </p>
            <p style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              <strong>ফরম্যাট:</strong> A4 সাইজ PDF
            </p>
            <p className="text-sm text-blue-600 mt-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              <em>এটি ডাটাবেস থেকে আসা আসল প্রশ্নপত্র।</em>
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
            বিশেষ বৈশিষ্ট্য
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              <span style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                ডাটাবেস থেকে আসল প্রশ্নসমূহ
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              <span style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                বাংলা ফন্ট সমর্থন (Noto Sans Bengali)
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              <span style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                পেশাদার ও পরিষ্কার লেআউট
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              <span style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                PDF সার্ভিস ব্যবহার করে PDF তৈরি
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={handlePreview}
            disabled={loading}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50"
            style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
          >
            {loading ? 'লোড হচ্ছে...' : 'প্রিভিউ'}
          </button>
          
          <button
            onClick={handleDownloadPDF}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
          >
            {loading ? 'PDF তৈরি হচ্ছে...' : 'ডাউনলোড PDF'}
          </button>
        </div>
      </div>

      {/* PDF Loading Modal */}
      <PDFLoadingModal
        isOpen={showLoadingModal}
        onClose={() => setShowLoadingModal(false)}
        title="প্রশ্নপত্র তৈরি হচ্ছে"
        message="প্রশ্নপত্রের PDF তৈরি করা হচ্ছে"
        type="question"
      />
    </div>
  );
};

export default PDFGenerator;