import React, { useState } from 'react';
import QueuingSimulator from './pages/QueuingSimulator'; 
import QueuingCalculator from './pages/QueuingCalculator'; 

const App = () => {
  const [activeTab, setActiveTab] = useState('simulator');

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-6 md:p-12">
      
      {/* Top View Switcher */}
      <div className="flex justify-center mb-8">
        <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 inline-flex">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-13 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'simulator'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Simulator
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'calculator'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Queuing Calculator
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex justify-center">
        {activeTab === 'simulator' ? (
          <QueuingSimulator />
        ) : (
          <QueuingCalculator />
        )}
      </div>

    </div>
  );
};

export default App;