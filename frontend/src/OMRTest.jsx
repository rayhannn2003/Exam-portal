import React, { useState } from 'react';
import OMRUpload from './components/OMRUpload';
import { ToastProvider } from './contexts/ToastContext';

const OMRTest = () => {
  const [showOMRUpload, setShowOMRUpload] = useState(false);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">
            OMR Upload Test Page
          </h1>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Test OMR Upload Button</h2>
            
            <button
              onClick={() => {
                console.log('Test OMR Upload button clicked!');
                setShowOMRUpload(true);
              }}
              className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2 cursor-pointer"
              style={{ pointerEvents: 'auto', zIndex: 10 }}
            >
              <span>📄</span>
              <span>Test OMR Upload</span>
            </button>
            
            <div className="mt-4">
              <p className="text-gray-600">
                Button clicked: {showOMRUpload ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
        </div>
        
        {showOMRUpload && (
          <OMRUpload
            onClose={() => {
              console.log('OMR Upload modal closing');
              setShowOMRUpload(false);
            }}
            onSuccess={(result) => {
              console.log('OMR Upload successful:', result);
              setShowOMRUpload(false);
            }}
          />
        )}
      </div>
    </ToastProvider>
  );
};

export default OMRTest;
