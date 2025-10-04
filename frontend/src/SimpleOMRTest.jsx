import React, { useState } from 'react';
import { ToastProvider } from './contexts/ToastContext';

const SimpleOMRTest = () => {
  const [showModal, setShowModal] = useState(false);

  console.log('SimpleOMRTest rendered, showModal:', showModal);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">
            Simple OMR Test - Debug Blank Page Issue
          </h1>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Test Modal Rendering</h2>
            
            <button
              onClick={() => {
                console.log('Button clicked, setting showModal to true');
                setShowModal(true);
              }}
              className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
            >
              Open Test Modal
            </button>
            
            <div className="mt-4">
              <p className="text-gray-600">
                Modal state: {showModal ? 'Open' : 'Closed'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Simple Modal */}
        {showModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            style={{ zIndex: 9999 }}
          >
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Test Modal
              </h3>
              <p className="text-gray-600 mb-4">
                If you can see this modal, the rendering is working!
              </p>
              <button
                onClick={() => {
                  console.log('Close button clicked');
                  setShowModal(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Close Modal
              </button>
            </div>
          </div>
        )}
      </div>
    </ToastProvider>
  );
};

export default SimpleOMRTest;
