import React from 'react';

function AdminSidebar({ onSelect }) {
  return (
    <div className="fixed top-0 left-0 h-full w-64 bg-blue-900 text-white p-6 font-poppins">
      <h2 className="text-2xl font-bold mb-8">Admin Menu</h2>
      <nav className="flex flex-col space-y-4">
        <button
          onClick={() => onSelect('viewUsers')}
          className="text-left hover:bg-blue-700 px-3 py-2 rounded"
        >
          View Users
        </button>
        <button
          onClick={() => onSelect('viewTickets')}
          className="text-left hover:bg-blue-700 px-3 py-2 rounded"
        >
          View Tickets
        </button>
        <button
          onClick={() => onSelect('assignTickets')}
          className="text-left hover:bg-blue-700 px-3 py-2 rounded"
        >
          Assign Tickets
        </button>
        <button
          onClick={() => onSelect('viewComments')}
          className="text-left hover:bg-blue-700 px-3 py-2 rounded"
        >
          View Comments
        </button>
        <button
          onClick={() => onSelect('viewProfile')}
          className="text-left hover:bg-blue-700 px-3 py-2 rounded"
        >
          View Profile
        </button>
       
      </nav>
    </div>
  );
}

export default AdminSidebar;
