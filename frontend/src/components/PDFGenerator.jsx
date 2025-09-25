import React, { useState } from 'react';
import { useToast } from '../contexts/ToastContext';

const PDFGenerator = ({ examId, setId, examTitle, setName, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [customization, setCustomization] = useState({
    paper_size: 'A4',
    orientation: 'portrait',
    font_size: '12pt',
    margin_type: 'normal',
    show_logo: true,
    show_title: true,
    show_class: true,
    show_date: true,
    show_duration: true,
    show_marks: true,
    show_instructions: true,
    organization_name: 'Your School Name',
    show_page_numbers: true,
    show_answer_spaces: true,
    watermark: '',
    footer_text: 'Good luck with your exam!'
  });
  const [previewMode, setPreviewMode] = useState(false);
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
          templateType: 'default',
          customization: customization
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

  const handleCustomizationChange = (field, value) => {
    setCustomization(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Generate Question Paper PDF
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Exam Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Exam Information</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><strong>Title:</strong> {examTitle}</p>
              <p><strong>Set:</strong> {setName}</p>
              <p><strong>ID:</strong> {examId}</p>
            </div>
          </div>

          {/* Customization Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Customization Options</h3>
            
            {/* Paper Settings */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-600">Paper Settings</h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Paper Size
                  </label>
                  <select
                    value={customization.paper_size}
                    onChange={(e) => handleCustomizationChange('paper_size', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="A4">A4</option>
                    <option value="A3">A3</option>
                    <option value="Legal">Legal</option>
                    <option value="Letter">Letter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Orientation
                  </label>
                  <select
                    value={customization.orientation}
                    onChange={(e) => handleCustomizationChange('orientation', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Font Size
                  </label>
                  <select
                    value={customization.font_size}
                    onChange={(e) => handleCustomizationChange('font_size', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="10pt">10pt</option>
                    <option value="11pt">11pt</option>
                    <option value="12pt">12pt</option>
                    <option value="14pt">14pt</option>
                    <option value="16pt">16pt</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Margin Type
                  </label>
                  <select
                    value={customization.margin_type}
                    onChange={(e) => handleCustomizationChange('margin_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="narrow">Narrow</option>
                    <option value="normal">Normal</option>
                    <option value="wide">Wide</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Header Options */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-600">Header Options</h4>
              
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={customization.show_logo}
                    onChange={(e) => handleCustomizationChange('show_logo', e.target.checked)}
                    className="mr-2"
                  />
                  Show Logo
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={customization.show_title}
                    onChange={(e) => handleCustomizationChange('show_title', e.target.checked)}
                    className="mr-2"
                  />
                  Show Exam Title
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={customization.show_class}
                    onChange={(e) => handleCustomizationChange('show_class', e.target.checked)}
                    className="mr-2"
                  />
                  Show Class Information
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={customization.show_date}
                    onChange={(e) => handleCustomizationChange('show_date', e.target.checked)}
                    className="mr-2"
                  />
                  Show Date
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={customization.show_duration}
                    onChange={(e) => handleCustomizationChange('show_duration', e.target.checked)}
                    className="mr-2"
                  />
                  Show Duration
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={customization.show_marks}
                    onChange={(e) => handleCustomizationChange('show_marks', e.target.checked)}
                    className="mr-2"
                  />
                  Show Total Marks
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization Name
                </label>
                <input
                  type="text"
                  value={customization.organization_name}
                  onChange={(e) => handleCustomizationChange('organization_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your School Name"
                />
              </div>
            </div>

            {/* Footer Options */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-600">Footer Options</h4>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={customization.show_page_numbers}
                  onChange={(e) => handleCustomizationChange('show_page_numbers', e.target.checked)}
                  className="mr-2"
                />
                Show Page Numbers
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={customization.show_answer_spaces}
                  onChange={(e) => handleCustomizationChange('show_answer_spaces', e.target.checked)}
                  className="mr-2"
                />
                Show Answer Spaces
              </label>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Footer Text
                </label>
                <input
                  type="text"
                  value={customization.footer_text}
                  onChange={(e) => handleCustomizationChange('footer_text', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Custom footer text"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Watermark
                </label>
                <input
                  type="text"
                  value={customization.watermark}
                  onChange={(e) => handleCustomizationChange('watermark', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Watermark text (optional)"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
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

export default PDFGenerator;
