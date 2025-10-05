import React, { useState, useRef } from 'react';
import { useToast } from '../contexts/ToastContext';
import api from '../assets/services/api';
import JSZip from 'jszip';

const OMRUpload = ({ onClose, onSuccess }) => {
  console.log('OMRUpload component rendered');
  
  // Single upload states
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [processingResult, setProcessingResult] = useState(null);
  const [evaluatedImage, setEvaluatedImage] = useState(null);
  const fileInputRef = useRef(null);
  
  // Bulk upload states
  const [uploadMode, setUploadMode] = useState('single'); // 'single' or 'bulk'
  const [selectedZipFile, setSelectedZipFile] = useState(null);
  const [zipInputRef] = useState(useRef(null));
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [extractedImages, setExtractedImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [bulkResults, setBulkResults] = useState([]);
  const [bulkProcessingResult, setBulkProcessingResult] = useState(null);
  const [bulkEvaluatedImage, setBulkEvaluatedImage] = useState(null);
  
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

  // Bulk upload functions
  const handleZipFileSelect = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.name.toLowerCase().endsWith('.zip')) {
        showError('Please select a valid ZIP file');
        return;
      }
      
      // Validate file size (max 100MB for ZIP)
      if (file.size > 100 * 1024 * 1024) {
        showError('ZIP file size must be less than 100MB');
        return;
      }
      
      setSelectedZipFile(file);
      setExtractedImages([]);
      setBulkResults([]);
      setCurrentImageIndex(0);
      setBulkProcessingResult(null);
      setBulkEvaluatedImage(null);
      
      try {
        // Extract ZIP file
        const zip = new JSZip();
        const zipContent = await zip.loadAsync(file);
        const imageFiles = [];
        
        console.log('ZIP contents:', Object.keys(zipContent.files));
        
        for (const [filename, zipEntry] of Object.entries(zipContent.files)) {
          if (!zipEntry.dir && /\.(jpg|jpeg|png)$/i.test(filename)) {
            console.log(`Processing file: ${filename}`);
            
            try {
              const blob = await zipEntry.async('blob');
              console.log(`Blob created for ${filename}:`, {
                size: blob.size,
                type: blob.type
              });
              
              // Ensure proper MIME type
              let mimeType = blob.type;
              if (!mimeType || mimeType === 'application/octet-stream') {
                if (/\.jpg$/i.test(filename) || /\.jpeg$/i.test(filename)) {
                  mimeType = 'image/jpeg';
                } else if (/\.png$/i.test(filename)) {
                  mimeType = 'image/png';
                }
              }
              
              const fileObj = new File([blob], filename, { 
                type: mimeType,
                lastModified: Date.now()
              });
              
              console.log(`File object created for ${filename}:`, {
                name: fileObj.name,
                size: fileObj.size,
                type: fileObj.type,
                lastModified: fileObj.lastModified
              });
              
              imageFiles.push(fileObj);
            } catch (fileErr) {
              console.error(`Error processing file ${filename}:`, fileErr);
            }
          }
        }
        
        if (imageFiles.length === 0) {
          showError('No valid image files found in ZIP. Please ensure ZIP contains JPG, JPEG, or PNG files.');
          return;
        }
        
        console.log(`Successfully extracted ${imageFiles.length} images:`, imageFiles.map(f => f.name));
        setExtractedImages(imageFiles);
        success(`✅ ZIP extracted successfully! Found ${imageFiles.length} image(s).`);
        
      } catch (err) {
        console.error('Error extracting ZIP:', err);
        showError('Failed to extract ZIP file. Please ensure it\'s a valid ZIP archive.');
      }
    }
  };

  const handleRemoveZipFile = () => {
    setSelectedZipFile(null);
    setExtractedImages([]);
    setBulkResults([]);
    setCurrentImageIndex(0);
    setBulkProcessingResult(null);
    setBulkEvaluatedImage(null);
    if (zipInputRef.current) {
      zipInputRef.current.value = '';
    }
  };

  const processCurrentImage = async () => {
    if (currentImageIndex >= extractedImages.length) return;
    
    const currentImage = extractedImages[currentImageIndex];
    setBulkProcessing(true);
    setBulkProcessingResult(null);
    setBulkEvaluatedImage(null);
    
    try {
      console.log(`Processing image ${currentImageIndex + 1}/${extractedImages.length}: ${currentImage.name}`);
      console.log('Image details:', {
        name: currentImage.name,
        size: currentImage.size,
        type: currentImage.type,
        lastModified: currentImage.lastModified
      });
      
      // Validate the image file
      if (!currentImage || currentImage.size === 0) {
        throw new Error('Invalid image file extracted from ZIP');
      }
      
      // Additional validation for extracted files
      if (currentImage.size > 10 * 1024 * 1024) {
        throw new Error('Image file too large (max 10MB)');
      }
      
      // Ensure proper MIME type for extracted files
      if (!currentImage.type || currentImage.type === 'application/octet-stream') {
        console.warn('Invalid MIME type detected, attempting to fix...');
        if (/\.jpg$/i.test(currentImage.name) || /\.jpeg$/i.test(currentImage.name)) {
          currentImage.type = 'image/jpeg';
        } else if (/\.png$/i.test(currentImage.name)) {
          currentImage.type = 'image/png';
        }
      }
      
      const formData = new FormData();
      formData.append('image', currentImage);

      console.log('Sending bulk OMR request...');
      const response = await api.post(OMR_API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = response.data;
      console.log('Bulk OMR processing result:', result);
      setBulkProcessingResult(result);

      // Handle the processed image if present
      if (result.processed_image) {
        try {
          const imageData = `data:image/jpeg;base64,${result.processed_image}`;
          setBulkEvaluatedImage(imageData);
        } catch (imageErr) {
          console.error('Error processing evaluated image:', imageErr);
        }
      }

    } catch (err) {
      console.error('Bulk OMR processing error:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      const errorMessage = err.response?.data?.error || err.message || 'Processing failed';
      setBulkProcessingResult({
        success: false,
        error: errorMessage,
        details: err.response?.data?.details || {}
      });
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleBulkAction = async (action) => {
    if (action === 'add' && bulkProcessingResult?.success) {
      // Check if student is registered
      if (!bulkProcessingResult.student_info) {
        showError('❌ Cannot add unregistered student to database. Please register the student first.');
        return;
      }
      
      try {
        setBulkProcessing(true);
        
        const submissionData = {
          roll_number: bulkProcessingResult.roll_number,
          answers: bulkProcessingResult.answers,
          score: bulkProcessingResult.score,
          score_percentage: bulkProcessingResult.score_percentage,
          total_questions: bulkProcessingResult.total_questions,
          student_info: bulkProcessingResult.student_info,
          success: bulkProcessingResult.success
        };

        const response = await api.post('/results/submit', submissionData);
        
        // Add to bulk results
        setBulkResults(prev => [...prev, {
          imageName: extractedImages[currentImageIndex].name,
          result: bulkProcessingResult,
          status: 'added',
          response: response.data
        }]);
        
        success(`✅ Image ${currentImageIndex + 1} added to database successfully!`);
        
      } catch (err) {
        console.error('Error submitting bulk result:', err);
        showError(`❌ Failed to save result: ${err.response?.data?.message || err.message}`);
        
        setBulkResults(prev => [...prev, {
          imageName: extractedImages[currentImageIndex].name,
          result: bulkProcessingResult,
          status: 'failed',
          error: err.message
        }]);
      } finally {
        setBulkProcessing(false);
      }
    } else if (action === 'skip') {
      setBulkResults(prev => [...prev, {
        imageName: extractedImages[currentImageIndex].name,
        result: bulkProcessingResult,
        status: 'skipped'
      }]);
      success(`⏭️ Image ${currentImageIndex + 1} skipped.`);
    }
    
    // Move to next image
    if (currentImageIndex < extractedImages.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
      setBulkProcessingResult(null);
      setBulkEvaluatedImage(null);
    } else {
      // All images processed
      const addedCount = bulkResults.filter(r => r.status === 'added').length + (action === 'add' ? 1 : 0);
      const skippedCount = bulkResults.filter(r => r.status === 'skipped').length + (action === 'skip' ? 1 : 0);
      const failedCount = bulkResults.filter(r => r.status === 'failed').length;
      
      success(`🎉 Bulk processing completed! Added: ${addedCount}, Skipped: ${skippedCount}, Failed: ${failedCount}`);
      
      if (onSuccess) {
        onSuccess({ type: 'bulk', results: bulkResults });
      }
    }
  };

  const handleCancelBulk = () => {
    setSelectedZipFile(null);
    setExtractedImages([]);
    setBulkResults([]);
    setCurrentImageIndex(0);
    setBulkProcessingResult(null);
    setBulkEvaluatedImage(null);
    setUploadMode('single');
    success('Bulk upload cancelled.');
  };

  const handleDone = async () => {
    if (processingResult && processingResult.success) {
      // Check if student is registered
      if (!processingResult.student_info) {
        showError('❌ Cannot add unregistered student to database. Please register the student first.');
        return;
      }
      
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

        {/* Upload Mode Selection */}
        <div className="mb-6">
          <div className="flex space-x-4 mb-4">
            <button
              onClick={() => setUploadMode('single')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                uploadMode === 'single'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              📄 Single Upload
            </button>
            <button
              onClick={() => setUploadMode('bulk')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                uploadMode === 'bulk'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              📦 Bulk Upload (ZIP)
            </button>
          </div>
        </div>

        {/* File Upload Section */}
        {uploadMode === 'single' ? (
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
        ) : (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select ZIP File with OMR Images
            </label>
            
            {!selectedZipFile ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                <input
                  ref={zipInputRef}
                  type="file"
                  accept=".zip"
                  onChange={handleZipFileSelect}
                  className="hidden"
                  id="zip-upload"
                />
                <label htmlFor="zip-upload" className="cursor-pointer">
                  <div className="text-6xl mb-4">📦</div>
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Click to upload ZIP file
                  </p>
                  <p className="text-sm text-gray-500">
                    ZIP file containing JPG, JPEG, PNG images (max 100MB)
                  </p>
                </label>
              </div>
            ) : (
              <div className="border border-gray-300 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="text-2xl mr-3">📦</div>
                    <div>
                      <p className="font-medium text-gray-700">{selectedZipFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(selectedZipFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      {extractedImages.length > 0 && (
                        <p className="text-sm text-green-600">
                          {extractedImages.length} image(s) extracted
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveZipFile}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bulk Processing Progress */}
        {uploadMode === 'bulk' && extractedImages.length > 0 && (
          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                📦 Bulk Processing Progress
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-700">
                    Processing: {currentImageIndex + 1} of {extractedImages.length}
                  </span>
                  <span className="text-sm text-blue-600">
                    {Math.round(((currentImageIndex + 1) / extractedImages.length) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentImageIndex + 1) / extractedImages.length) * 100}%` }}
                  ></div>
                </div>
                <div className="text-sm text-blue-600">
                  Current: {extractedImages[currentImageIndex]?.name}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Processing Results */}
        {uploadMode === 'bulk' && bulkProcessingResult && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Bulk Processing Results - Image {currentImageIndex + 1}
            </h3>
            
            <div className={`p-4 rounded-lg border ${
              bulkProcessingResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
            }`}>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">Status:</span>
                    <span className={`ml-2 ${bulkProcessingResult.success ? 'text-green-600' : 'text-red-600'}`}>
                      {bulkProcessingResult.success ? 'Success' : 'Failed'}
                    </span>
                  </div>
                  
                  <div>
                    <span className="font-medium">Roll Number:</span>
                    <span className={`ml-2 ${bulkProcessingResult.roll_number ? 'text-green-600' : 'text-red-600'}`}>
                      {bulkProcessingResult.roll_number || 'Not detected'}
                    </span>
                  </div>
                </div>
                
                {bulkProcessingResult.success && (
                  <>
                    {bulkProcessingResult.student_info ? (
                      <div className="mt-3 p-3 bg-green-50 rounded border-l-4 border-green-400">
                        <h5 className="font-medium text-green-800 mb-2">👤 Student Information:</h5>
                        <div className="grid grid-cols-1 gap-2 text-sm">
                          <div><span className="font-medium">Name:</span> <span className="text-green-700">{bulkProcessingResult.student_info.name}</span></div>
                          <div><span className="font-medium">Roll Number:</span> <span className="text-green-700">{bulkProcessingResult.roll_number}</span></div>
                          <div><span className="font-medium">School:</span> <span className="text-green-700">{bulkProcessingResult.student_info.school}</span></div>
                          <div><span className="font-medium">Class:</span> <span className="text-green-700">{bulkProcessingResult.student_info.class}</span></div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
                        <h5 className="font-medium text-yellow-800 mb-2">⚠️ Student Registration Status:</h5>
                        <div className="text-sm text-yellow-700">
                          <p className="font-medium">This roll number is not registered in the database</p>
                          <p className="text-xs mt-1 opacity-90">
                            Roll Number: <span className="font-mono">{bulkProcessingResult.roll_number}</span> is not found in the system.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                      <h5 className="font-medium text-blue-800 mb-2">📊 Results:</h5>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Total Questions: <span className="font-medium">{bulkProcessingResult.total_questions || 0}</span></div>
                        <div>Score: <span className="font-medium text-green-600">{bulkProcessingResult.score || 0}</span></div>
                        <div>Percentage: <span className="font-medium text-purple-600">{bulkProcessingResult.score_percentage || 0}%</span></div>
                        <div>Status: <span className="font-medium text-green-600">✅ Processed</span></div>
                      </div>
                    </div>
                  </>
                )}
                
                {!bulkProcessingResult.success && (
                  <div className="mt-4 p-4 bg-red-50 rounded-lg border-l-4 border-red-400">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <span className="text-red-400 text-xl">❌</span>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-red-800">Processing Failed</h4>
                        <div className="mt-2 text-sm text-red-700">
                          <p className="font-medium">{bulkProcessingResult.error || 'Unknown error occurred'}</p>
                          {bulkProcessingResult.details?.error && (
                            <p className="mt-1 text-xs opacity-90">{bulkProcessingResult.details.error}</p>
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
          </div>
        )}

        {/* Bulk Processed Image Display */}
        {uploadMode === 'bulk' && bulkEvaluatedImage && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Processed OMR Sheet - Image {currentImageIndex + 1}
            </h3>
            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
              <img 
                src={bulkEvaluatedImage} 
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

        {/* Processing Results */}
        {uploadMode === 'single' && processingResult && (
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
                    {processingResult.student_info ? (
                      <div className="mt-3 p-3 bg-green-50 rounded border-l-4 border-green-400">
                        <h5 className="font-medium text-green-800 mb-2">👤 Student Information:</h5>
                        <div className="grid grid-cols-1 gap-2 text-sm">
                          <div><span className="font-medium">Name:</span> <span className="text-green-700">{processingResult.student_info.name}</span></div>
                          <div><span className="font-medium">Roll Number:</span> <span className="text-green-700">{processingResult.roll_number}</span></div>
                          <div><span className="font-medium">School:</span> <span className="text-green-700">{processingResult.student_info.school}</span></div>
                          <div><span className="font-medium">Class:</span> <span className="text-green-700">{processingResult.student_info.class}</span></div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
                        <h5 className="font-medium text-yellow-800 mb-2">⚠️ Student Registration Status:</h5>
                        <div className="text-sm text-yellow-700">
                          <p className="font-medium">This roll number is not registered in the database</p>
                          <p className="text-xs mt-1 opacity-90">
                            Roll Number: <span className="font-mono">{processingResult.roll_number}</span> is not found in the system.
                          </p>
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
          {uploadMode === 'bulk' && extractedImages.length > 0 ? (
            <>
              <button
                onClick={handleCancelBulk}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                disabled={bulkProcessing}
              >
                Cancel Bulk Upload
              </button>
              
              {!bulkProcessingResult ? (
                <button
                  onClick={processCurrentImage}
                  disabled={bulkProcessing}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  {bulkProcessing && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                  <span>
                    {bulkProcessing ? 'Processing...' : 'Process Current Image'}
                  </span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleBulkAction('skip')}
                    disabled={bulkProcessing}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:opacity-50 flex items-center space-x-2"
                  >
                    <span>⏭️</span>
                    <span>Skip</span>
                  </button>
                  
                  {bulkProcessingResult.success && (
                    <button
                      onClick={() => handleBulkAction('add')}
                      disabled={bulkProcessing || !bulkProcessingResult.student_info}
                      className={`px-4 py-2 rounded-md flex items-center space-x-2 ${
                        bulkProcessingResult.student_info
                          ? 'bg-green-600 text-white hover:bg-green-700 disabled:opacity-50'
                          : 'bg-gray-400 text-white cursor-not-allowed'
                      }`}
                      title={!bulkProcessingResult.student_info ? 'Cannot add unregistered student to database' : ''}
                    >
                      {bulkProcessing && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                      <span>
                        {bulkProcessing ? 'Saving...' : 
                         !bulkProcessingResult.student_info ? '❌ Student Not Registered' : 
                         '✅ Add to Database'}
                      </span>
                    </button>
                  )}
                  
                  {currentImageIndex < extractedImages.length - 1 && (
                    <button
                      onClick={() => {
                        setCurrentImageIndex(prev => prev + 1);
                        setBulkProcessingResult(null);
                        setBulkEvaluatedImage(null);
                      }}
                      disabled={bulkProcessing}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                    >
                      <span>➡️</span>
                      <span>Next Image</span>
                    </button>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                disabled={loading}
              >
                Cancel
              </button>
              
              {uploadMode === 'single' && processingResult && processingResult.success ? (
                <button
                  onClick={handleDone}
                  disabled={loading || !processingResult.student_info}
                  className={`px-6 py-2 rounded-md flex items-center space-x-2 ${
                    processingResult.student_info
                      ? 'bg-green-600 text-white hover:bg-green-700 disabled:opacity-50'
                      : 'bg-gray-400 text-white cursor-not-allowed'
                  }`}
                  title={!processingResult.student_info ? 'Cannot add unregistered student to database' : ''}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Saving to Database...</span>
                    </>
                  ) : (
                    <>
                      <span>{processingResult.student_info ? '✅' : '❌'}</span>
                      <span>
                        {processingResult.student_info ? 'Done - Add to Results' : 'Student Not Registered'}
                      </span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={uploadMode === 'single' ? handleUploadOMR : () => {}}
                  disabled={loading || (uploadMode === 'single' && !selectedFile) || (uploadMode === 'bulk' && !selectedZipFile)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                  <span>
                    {loading ? 'Processing...' : 
                     uploadMode === 'single' && processingResult && !processingResult.success ? 'Try Again' : 
                     uploadMode === 'single' ? 'Process OMR Sheet' :
                     'Select ZIP File'}
                  </span>
                </button>
              )}
            </>
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
