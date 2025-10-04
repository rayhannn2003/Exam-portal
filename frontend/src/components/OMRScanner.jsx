import React, { useState, useRef } from 'react';
import { useToast } from '../contexts/ToastContext';

const OMRScanner = ({ examId, classId, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [processingResults, setProcessingResults] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);
  const { success, error: showError } = useToast();

  const OMR_SERVICE_URL = process.env.REACT_APP_OMR_SERVICE_URL || 'http://localhost:8001';

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
    setProcessingResults(null);
  };

  const handleSingleProcess = async () => {
    if (selectedFiles.length === 0) {
      showError('Please select at least one OMR sheet to process');
      return;
    }

    setLoading(true);
    try {
      const results = [];
      
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('exam_id', examId);
        formData.append('class_id', classId);

        const response = await fetch(`${OMR_SERVICE_URL}/process-omr`, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          results.push({
            filename: file.name,
            ...result
          });
        } else {
          const errorData = await response.json();
          results.push({
            filename: file.name,
            success: false,
            error: errorData.detail || 'Processing failed'
          });
        }
      }

      setProcessingResults(results);
      
      const successful = results.filter(r => r.success).length;
      if (successful > 0) {
        success(`${successful} OMR sheet(s) processed successfully!`);
        if (onSuccess) onSuccess(results.filter(r => r.success));
      } else {
        showError('No OMR sheets were processed successfully');
      }

    } catch (err) {
      console.error('OMR processing error:', err);
      showError('Failed to process OMR sheets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBatchProcess = async () => {
    if (selectedFiles.length === 0) {
      showError('Please select OMR sheets to process');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });
      formData.append('exam_id', examId);
      formData.append('class_id', classId);

      const response = await fetch(`${OMR_SERVICE_URL}/batch-process`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setProcessingResults(result.batch_results);
        success(`Batch processing completed! ${result.batch_results.filter(r => r.result?.success).length} sheets processed successfully.`);
      } else {
        const errorData = await response.json();
        showError(errorData.detail || 'Batch processing failed');
      }

    } catch (err) {
      console.error('Batch processing error:', err);
      showError('Failed to process OMR sheets in batch. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadResults = (result) => {
    if (!result.success) return;

    const data = {
      roll_number: result.roll_number,
      score: result.score,
      percentage: result.percentage,
      correct_count: result.correct_count,
      total_questions: result.total_questions,
      student_answers: result.student_answers,
      processing_time: result.processing_time,
      confidence_score: result.confidence_score
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OMR_Results_${result.roll_number}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            OMR Sheet Scanner
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* File Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select OMR Sheet Images
          </label>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {selectedFiles.length > 0 && (
            <p className="mt-2 text-sm text-gray-600">
              {selectedFiles.length} file(s) selected
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mb-6">
          <button
            onClick={handleSingleProcess}
            disabled={loading || selectedFiles.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Process Sheets'}
          </button>
          
          <button
            onClick={handleBatchProcess}
            disabled={loading || selectedFiles.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Batch Process'}
          </button>
        </div>

        {/* Processing Results */}
        {processingResults && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Processing Results
            </h3>
            
            <div className="space-y-4">
              {processingResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    result.success || result.result?.success
                      ? 'border-green-200 bg-green-50'
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-800">
                        {result.filename}
                      </h4>
                      
                      {result.success || result.result?.success ? (
                        <div className="mt-2 text-sm text-gray-600">
                          <p><strong>Roll Number:</strong> {result.roll_number || result.result?.roll_number}</p>
                          <p><strong>Score:</strong> {result.score || result.result?.score} / {result.total_questions || result.result?.total_questions}</p>
                          <p><strong>Percentage:</strong> {result.percentage || result.result?.percentage}%</p>
                          <p><strong>Confidence:</strong> {result.confidence_score || result.result?.confidence_score}%</p>
                          <p><strong>Processing Time:</strong> {result.processing_time || result.result?.processing_time}s</p>
                        </div>
                      ) : (
                        <div className="mt-2 text-sm text-red-600">
                          <p><strong>Error:</strong> {result.error || result.result?.error || 'Processing failed'}</p>
                        </div>
                      )}
                    </div>
                    
                    {(result.success || result.result?.success) && (
                      <button
                        onClick={() => downloadResults(result.result || result)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Download
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Instructions:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Upload clear, well-lit images of OMR sheets</li>
            <li>• Ensure fiducial markers are visible and not damaged</li>
            <li>• Roll numbers should be clearly marked</li>
            <li>• Multiple choice answers should be filled completely</li>
            <li>• Supported formats: JPG, PNG, JPEG</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OMRScanner;
