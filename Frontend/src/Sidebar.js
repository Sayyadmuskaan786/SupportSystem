import React from 'react';

function Sidebar({ activeView, setActiveView, isOpen, toggleSidebar }) {
  return (
    <>
      {/* Overlay for mobile when sidebar is open */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={toggleSidebar}
      ></div>

      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-blue-900 to-blue-700 p-6 flex flex-col z-50 shadow-lg transform transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-10 text-center border-b border-white border-opacity-20 pb-4">
          <h1 className="text-white text-2xl font-semibold tracking-wide">Employee Menu</h1>
          <span className="text-blue-300 text-sm block mt-1">Manage your tickets</span>
        </div>
        <nav className="flex flex-col gap-3">
          <button
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-white font-medium transition-transform duration-300 ${
              activeView === 'create' ? 'bg-blue-300 text-blue-900' : 'hover:bg-white hover:text-blue-900'
            }`}
            onClick={() => {
              setActiveView('create');
              toggleSidebar();
            }}
          >
            <i className="fas fa-plus-circle"></i>
            <span>Create Ticket</span>
          </button>
          <button
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-white font-medium transition-transform duration-300 ${
              activeView === 'view' ? 'bg-blue-300 text-blue-900' : 'hover:bg-white hover:text-blue-900'
            }`}
            onClick={() => {
              setActiveView('view');
              toggleSidebar();
            }}
          >
            <i className="fas fa-ticket-alt"></i>
            <span>View Tickets</span>
          </button>
          <button
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-white font-medium transition-transform duration-300 ${
              activeView === 'comments' ? 'bg-blue-300 text-blue-900' : 'hover:bg-white hover:text-blue-900'
            }`}
            onClick={() => {
              setActiveView('comments');
              toggleSidebar();
            }}
          >
            <i className="fas fa-comments"></i>
            <span>Comments</span>
          </button>
          <button
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-white font-medium transition-transform duration-300 ${
              activeView === 'profile' ? 'bg-blue-300 text-blue-900' : 'hover:bg-white hover:text-blue-900'
            }`}
            onClick={() => {
              setActiveView('profile');
              toggleSidebar();
            }}
          >
            <i className="fas fa-user"></i>
            <span>View Profile</span>
          </button>
        </nav>
      </div>
    </>
  );
}


export default Sidebar;
