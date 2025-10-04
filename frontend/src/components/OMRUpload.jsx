import React, { useState, useRef } from 'react';
import { useToast } from '../contexts/ToastContext';
import api from '../assets/services/api';

const OMRUpload = ({ onClose, onSuccess }) => {
  console.log('OMRUpload component rendered');
  
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [processingResult, setProcessingResult] = useState(null);
  const [evaluatedImage, setEvaluatedImage] = useState(null);
  const fileInputRef = useRef(null);
  
  const { success, error: showError } = useToast();

  const OMR_API_URL = '/omr/process-omr';

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showError('Please select a valid image file (JPG, JPEG, PNG)');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        showError('File size must be less than 10MB');
        return;
      }
      
      setSelectedFile(file);
      setProcessingResult(null);
      setEvaluatedImage(null);
    }
  };

  const handleUploadOMR = async () => {
    if (!selectedFile) {
      showError('Please select an OMR sheet image to upload');
      return;
    }

    setLoading(true);
    setProcessingResult(null);
    setEvaluatedImage(null);
    
    try {
      console.log('Starting OMR processing with new API...');
      
      // Prepare form data for the new API
      const formData = new FormData();
      formData.append('image', selectedFile);

      console.log('Sending OMR processing request to:', OMR_API_URL);

      // Process OMR sheet using the backend proxy
      const response = await api.post(OMR_API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = response.data;
      console.log('OMR processing result:', result);
      console.log('Response status:', response.status);
      setProcessingResult(result);

      // Handle the processed image if present
      if (result.processed_image) {
        try {
          // Convert base64 to image
          const imageData = `data:image/jpeg;base64,${result.processed_image}`;
          setEvaluatedImage(imageData);
        } catch (imageErr) {
          console.error('Error processing evaluated image:', imageErr);
        }
      }

      // Handle success response
      if (result.success) {
        success(`🎉 OMR processed successfully!
        
📊 Student: ${result.student_info?.name || 'Unknown'}
🆔 Roll Number: ${result.roll_number || 'Not detected'}
🏫 School: ${result.student_info?.school || 'Unknown'}
📚 Class: ${result.student_info?.class || 'Unknown'}

📈 Results:
• Total Questions: ${result.total_questions || 0}
• Score: ${result.score || 0}
• Percentage: ${result.score_percentage || 0}%`);
        
        // Don't automatically call onSuccess - wait for user to click Done
      } else {
        // Handle API error responses
        const errorMsg = result.error || result.message || 'Unknown processing error';
        const errorDetails = result.details?.error || result.details?.message || '';
        
        // Show professional error message
        showError(`❌ OMR Processing Failed
        
🔍 ত্রুটি: ${errorMsg}
${errorDetails ? `📋 বিবরণ: ${errorDetails}` : ''}

💡 অনুগ্রহ করে নিশ্চিত করুন:
• ছবিটি পরিষ্কার এবং ভালো আলোতে নেওয়া হয়েছে
• OMR শীটটি ক্ষতিগ্রস্ত বা ভাঁজ করা নেই
• সব ফিডুসিয়াল মার্কার দৃশ্যমান
• ছবির ফরম্যাট JPG বা PNG`);
        
        console.log('OMR processing failed:', result);
      }

    } catch (err) {
      console.error('OMR processing error:', err);
      console.error('Error response:', err.response);
      console.error('Error response data:', err.response?.data);
      
      // Handle different types of errors
      let errorMessage = 'Failed to process OMR sheet';
      let errorDetails = '';
      
      if (err.response) {
        // Server responded with error status
        const status = err.response.status;
        const responseData = err.response.data;
        
        console.log('Error response data:', responseData);
        
        // Try to get error message from response
        if (responseData?.error) {
          errorMessage = responseData.error;
        } else if (responseData?.message) {
          errorMessage = responseData.message;
        } else if (status === 422) {
          errorMessage = 'অবৈধ ছবির ফরম্যাট বা ক্ষতিগ্রস্ত ফাইল। অনুগ্রহ করে অন্য ছবি দিয়ে চেষ্টা করুন।';
        } else if (status === 413) {
          errorMessage = 'ছবির ফাইল খুব বড়। অনুগ্রহ করে ১০MB এর ছোট ছবি ব্যবহার করুন।';
        } else if (status >= 500) {
          errorMessage = 'সার্ভার ত্রুটি ঘটেছে। অনুগ্রহ করে পরে আবার চেষ্টা করুন।';
        } else {
          errorMessage = `সার্ভার ত্রুটি (${status})। অনুগ্রহ করে আবার চেষ্টা করুন।`;
        }
        
        // Get error details if available
        if (responseData?.details?.error) {
          errorDetails = responseData.details.error;
        }
        
        // Set processing result for error display
        setProcessingResult({
          success: false,
          error: errorMessage,
          details: responseData?.details || {}
        });
        
      } else if (err.request) {
        // Network error
        errorMessage = 'নেটওয়ার্ক ত্রুটি। অনুগ্রহ করে আপনার ইন্টারনেট সংযোগ পরীক্ষা করুন এবং আবার চেষ্টা করুন।';
      } else {
        // Other errors
        errorMessage = err.message || 'একটি অপ্রত্যাশিত ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।';
      }
      
      showError(`❌ ${errorMessage}${errorDetails ? `\n\n📋 বিবরণ: ${errorDetails}` : ''}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setProcessingResult(null);
    setEvaluatedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDone = async () => {
    if (processingResult && processingResult.success) {
      try {
        setLoading(true);
        
        // Prepare data for submission
        const submissionData = {
          roll_number: processingResult.roll_number,
          answers: processingResult.answers,
          score: processingResult.score,
          score_percentage: processingResult.score_percentage,
          total_questions: processingResult.total_questions,
          student_info: processingResult.student_info,
          success: processingResult.success
        };

        console.log('Submitting OMR result to database:', submissionData);

        // Submit to database
        const response = await api.post('/results/submit', submissionData);
        
        console.log('Database submission response:', response.data);
        
        success('✅ OMR result successfully added to database!');
        
        // Call onSuccess to refresh results and close modal
        if (onSuccess) {
          onSuccess(processingResult);
        }
        
      } catch (err) {
        console.error('Error submitting OMR result:', err);
        showError(`❌ Failed to save result to database: ${err.response?.data?.message || err.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  console.log('OMRUpload modal rendering, selectedFile:', selectedFile, 'loading:', loading);
  
  // Debug: Check if component is actually rendering
  if (typeof window !== 'undefined') {
    console.log('OMRUpload: About to render modal');
  }
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" 
      style={{ zIndex: 9999 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          console.log('Background clicked, closing modal');
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            📄 Upload OMR Sheet
          </h2>
          <button
            onClick={() => {
              console.log('Close button clicked');
              onClose();
            }}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* File Upload Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select OMR Sheet Image
          </label>
          
          {!selectedFile ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleFileSelect}
                className="hidden"
                id="omr-upload"
              />
              <label htmlFor="omr-upload" className="cursor-pointer">
                <div className="text-6xl mb-4">📄</div>
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Click to upload OMR sheet
                </p>
                <p className="text-sm text-gray-500">
                  Supports JPG, JPEG, PNG files (max 10MB)
                </p>
              </label>
            </div>
          ) : (
            <div className="border border-gray-300 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">📄</div>
                  <div>
                    <p className="font-medium text-gray-700">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveFile}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Processing Results */}
        {processingResult && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Processing Results
            </h3>
            
            <div className={`p-4 rounded-lg border ${
              processingResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
            }`}>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">Status:</span>
                    <span className={`ml-2 ${processingResult.success ? 'text-green-600' : 'text-red-600'}`}>
                      {processingResult.success ? 'Success' : 'Failed'}
                    </span>
                  </div>
                  
                  <div>
                    <span className="font-medium">Roll Number:</span>
                    <span className={`ml-2 ${processingResult.roll_number ? 'text-green-600' : 'text-red-600'}`}>
                      {processingResult.roll_number || 'Not detected'}
                    </span>
                  </div>
                </div>
                
                {processingResult.success && (
                  <>
                    {processingResult.student_info && (
                      <div className="mt-3 p-3 bg-green-50 rounded border-l-4 border-green-400">
                        <h5 className="font-medium text-green-800 mb-2">👤 Student Information:</h5>
                        <div className="grid grid-cols-1 gap-2 text-sm">
                          <div><span className="font-medium">Name:</span> <span className="text-green-700">{processingResult.student_info.name}</span></div>
                          <div><span className="font-medium">Roll Number:</span> <span className="text-green-700">{processingResult.roll_number}</span></div>
                          <div><span className="font-medium">School:</span> <span className="text-green-700">{processingResult.student_info.school}</span></div>
                          <div><span className="font-medium">Class:</span> <span className="text-green-700">{processingResult.student_info.class}</span></div>
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                      <h5 className="font-medium text-blue-800 mb-2">📊 Results:</h5>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Total Questions: <span className="font-medium">{processingResult.total_questions || 0}</span></div>
                        <div>Score: <span className="font-medium text-green-600">{processingResult.score || 0}</span></div>
                        <div>Percentage: <span className="font-medium text-purple-600">{processingResult.score_percentage || 0}%</span></div>
                        <div>Status: <span className="font-medium text-green-600">✅ Processed</span></div>
                      </div>
                    </div>

                    {processingResult.processing_details && (
                      <div className="mt-3 p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
                        <h5 className="font-medium text-yellow-800 mb-2">🔍 Processing Details:</h5>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>Database Lookup: <span className={`font-medium ${processingResult.processing_details.database_lookup_success ? 'text-green-600' : 'text-red-600'}`}>
                            {processingResult.processing_details.database_lookup_success ? '✅ Success' : '❌ Failed'}
                          </span></div>
                          <div>Fiducial Markers: <span className={`font-medium ${processingResult.processing_details.fiducial_markers_found ? 'text-green-600' : 'text-red-600'}`}>
                            {processingResult.processing_details.fiducial_markers_found ? '✅ Found' : '❌ Not Found'}
                          </span></div>
                          <div>Roll Number: <span className={`font-medium ${processingResult.processing_details.roll_number_decoded ? 'text-green-600' : 'text-red-600'}`}>
                            {processingResult.processing_details.roll_number_decoded ? '✅ Decoded' : '❌ Failed'}
                          </span></div>
                          <div>Bubbles Detected: <span className="font-medium text-blue-600">{processingResult.processing_details.total_bubbles_detected || 0}</span></div>
                          <div>Vertical Separators: <span className={`font-medium ${processingResult.processing_details.vertical_separators_found ? 'text-green-600' : 'text-red-600'}`}>
                            {processingResult.processing_details.vertical_separators_found ? '✅ Found' : '❌ Not Found'}
                          </span></div>
                          <div>Answer Key: <span className={`font-medium ${processingResult.processing_details.using_fallback_answer_key ? 'text-orange-600' : 'text-green-600'}`}>
                            {processingResult.processing_details.using_fallback_answer_key ? '⚠️ Fallback' : '✅ Standard'}
                          </span></div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
              
              {processingResult && !processingResult.success && (
                <div className="mt-4 p-4 bg-red-50 rounded-lg border-l-4 border-red-400">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <span className="text-red-400 text-xl">❌</span>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-red-800">Processing Failed</h4>
                      <div className="mt-2 text-sm text-red-700">
                        <p className="font-medium">{processingResult.error || 'Unknown error occurred'}</p>
                        {processingResult.details?.error && (
                          <p className="mt-1 text-xs opacity-90">{processingResult.details.error}</p>
                        )}
                      </div>
                      <div className="mt-3">
                        <h5 className="text-xs font-medium text-red-800 mb-1" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>💡 সমস্যা সমাধানের পরামর্শ:</h5>
                        <ul className="text-xs text-red-600 space-y-1" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                          <li>• ছবিটি পরিষ্কার এবং ভালো আলোতে নেওয়া হয়েছে কিনা নিশ্চিত করুন</li>
                          <li>• OMR শীটটি ক্ষতিগ্রস্ত বা ভাঁজ করা আছে কিনা পরীক্ষা করুন</li>
                          <li>• সব ফিডুসিয়াল মার্কার দৃশ্যমান কিনা যাচাই করুন</li>
                          <li>• ছবির ফরম্যাট JPG বা PNG কিনা নিশ্চিত করুন</li>
                          <li>• আরও ভালো আলোতে নতুন ছবি তুলে দেখুন</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Processed Image Display */}
        {evaluatedImage && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Processed OMR Sheet
            </h3>
            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
              <img 
                src={evaluatedImage} 
                alt="Processed OMR Sheet" 
                className="max-w-full h-auto rounded-lg shadow-sm"
                style={{ maxHeight: '500px' }}
              />
              <p className="text-sm text-gray-600 mt-2 text-center">
                This is how the system interpreted your OMR sheet
              </p>
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <div>
                  <p className="text-blue-800 font-medium">Processing OMR Sheet...</p>
                  <p className="text-blue-600 text-sm">Please wait while we analyze the image</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            disabled={loading}
          >
            Cancel
          </button>
          
          {processingResult && processingResult.success ? (
            <button
              onClick={handleDone}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving to Database...</span>
                </>
              ) : (
                <>
                  <span>✅</span>
                  <span>Done - Add to Results</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleUploadOMR}
              disabled={loading || !selectedFile}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
            >
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              <span>
                {loading ? 'Processing...' : 
                 processingResult && !processingResult.success ? 'Try Again' : 
                 'Process OMR Sheet'}
              </span>
            </button>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>নির্দেশাবলী:</h4>
          <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
            <li>• OMR শীটের পরিষ্কার এবং ভালো আলোর ছবি আপলোড করুন</li>
            <li>• সর্বোত্তম ফলাফলের জন্য ছবিটি JPG ফরম্যাটে নিশ্চিত করুন</li>
            <li>• রোল নম্বর গাঢ় পেন্সিল/কলম দিয়ে স্পষ্টভাবে চিহ্নিত করুন</li>
            <li>• বহু নির্বাচনী উত্তর সম্পূর্ণভাবে পূরণ করুন</li>
            <li>• সমর্থিত ফরম্যাট: JPG, JPEG, PNG (সর্বোচ্চ ১০MB)</li>
            <li>• সিস্টেম স্বয়ংক্রিয়ভাবে রোল নম্বর এবং উত্তর মূল্যায়ন করবে</li>
            <li>• সিস্টেম কীভাবে আপনার শীট ব্যাখ্যা করেছে তা দেখতে পাবেন</li>
          </ul>
        </div>

        {/* API Information */}
        <div className="mt-4 p-4 bg-green-50 rounded-lg">
          <h4 className="font-medium text-green-800 mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>প্রক্রিয়াকরণের ধাপসমূহ:</h4>
          <ul className="text-sm text-green-700 space-y-1" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
            <li>✅ <strong>ধাপ ১:</strong> আপনার OMR শীটের ছবি আপলোড করুন</li>
            <li>🔍 <strong>ধাপ ২:</strong> সিস্টেম প্রক্রিয়াকরণ করে ফলাফল দেখায়</li>
            <li>👀 <strong>ধাপ ৩:</strong> ছাত্রের তথ্য এবং প্রক্রিয়াকৃত ছবি পর্যালোচনা করুন</li>
            <li>✅ <strong>ধাপ ৪:</strong> ফলাফলে যোগ করতে "Done - Add to Results" ক্লিক করুন</li>
            <li>📊 <strong>বৈশিষ্ট্য:</strong> ভিজ্যুয়াল ফিডব্যাক, বিস্তারিত স্কোরিং, প্রক্রিয়াকরণের বিবরণ</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OMRUpload;
