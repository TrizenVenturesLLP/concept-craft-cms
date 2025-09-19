import React from 'react';
import ProblemManagement from './ProblemManagement';

// Test page that bypasses authentication
export default function TestProblems() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-6">
        <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
          <h2 className="text-lg font-semibold text-yellow-800">🧪 Test Mode</h2>
          <p className="text-yellow-700">
            This is a test page that bypasses authentication. 
            Use this to test the problem management features.
          </p>
        </div>
        <ProblemManagement />
      </div>
    </div>
  );
}
