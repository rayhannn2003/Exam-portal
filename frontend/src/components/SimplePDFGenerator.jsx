import React, { useState } from 'react';
import { useToast } from '../contexts/ToastContext';

const SimplePDFGenerator = ({ examId, setId, examTitle, setName, onClose }) => {
  const [loading, setLoading] = useState(false);
  const { success, error: showError } = useToast();

  const handleGeneratePDF = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/pdf/generate/${examId}/${setId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          templateType: 'default'
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${examTitle}_${setName}_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        success('PDF generated successfully!');
        onClose();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'PDF generation failed');
      }
    } catch (err) {
      showError(err.message || 'Failed to generate PDF');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/pdf/preview/${examId}/${setId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const htmlContent = await response.text();
        const newWindow = window.open('', '_blank');
        newWindow.document.write(htmlContent);
        newWindow.document.close();
        success('Preview opened in new window');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Preview generation failed');
      }
    } catch (err) {
      showError(err.message || 'Failed to generate preview');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            Generate Question Paper PDF
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Exam Information */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Exam Information</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p><strong>Title:</strong> {examTitle}</p>
            <p><strong>Set:</strong> {setName}</p>
            <p><strong>ID:</strong> {examId}</p>
          </div>
        </div>

        {/* Simple Options */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">PDF Options</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeAnswers"
                defaultChecked
                className="mr-2"
              />
              <label htmlFor="includeAnswers" className="text-sm text-gray-700">
                Include answer spaces for students
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeInstructions"
                defaultChecked
                className="mr-2"
              />
              <label htmlFor="includeInstructions" className="text-sm text-gray-700">
                Include general instructions
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includePageNumbers"
                defaultChecked
                className="mr-2"
              />
              <label htmlFor="includePageNumbers" className="text-sm text-gray-700">
                Include page numbers
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={handlePreview}
            disabled={loading}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Preview'}
          </button>
          
          <button
            onClick={handleGeneratePDF}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate PDF'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimplePDFGenerator;
