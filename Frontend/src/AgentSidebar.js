import React from 'react';

function AgentSidebar({ onSelect, activeView }) {
  return (
    <div className="fixed top-0 left-0 h-full w-64 bg-blue-900 text-white p-6 font-poppins z-50">
      <h2 className="text-2xl font-bold mb-8">Engineer Menu</h2>
      <nav className="flex flex-col space-y-4">
        <button
          onClick={() => onSelect('view')}
          className={`text-left px-3 py-2 rounded ${activeView === 'view' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}
        >
          View Tickets
        </button>
        <button
          onClick={() => onSelect('viewProfile')}
          className={`text-left px-3 py-2 rounded ${activeView === 'viewProfile' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}
        >
          Profile
        </button>
      </nav>
    </div>
  );
}

export default AgentSidebar;
