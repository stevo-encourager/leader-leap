
import React from 'react';

interface InvalidResultsMessageProps {
  onRestart: () => void;
}

const InvalidResultsMessage: React.FC<InvalidResultsMessageProps> = ({ onRestart }) => {
  return (
    <div className="p-6 text-center border border-red-200 rounded-lg bg-red-50">
      <p className="text-lg text-red-500 mb-4">Unable to display results: Invalid assessment data</p>
      <p className="text-sm text-gray-600 mb-4">
        This may be due to incomplete assessment data or a problem during the assessment process.
      </p>
      <button 
        className="bg-encourager hover:bg-encourager-light text-white px-4 py-2 rounded"
        onClick={onRestart}
      >
        Start New Assessment
      </button>
    </div>
  );
};

export default InvalidResultsMessage;
