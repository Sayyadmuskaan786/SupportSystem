import React from 'react';

const Contact = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-100 via-white to-gray-100 flex items-center justify-center p-8">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl p-12 border border-gray-200">
        <h1 className="text-5xl font-bold text-center text-gray-900 mb-8">Contact Us</h1>
        <p className="text-lg text-gray-700 mb-6">
          We are here to assist you. Please reach out to us using the following contact details:
        </p>
        <ul className="list-disc list-inside mt-3 text-gray-700 text-lg space-y-1">
          <li><strong>Phone:</strong> 7032967505</li>
          <li><strong>Email:</strong> muskaansayyad769@gmail.com</li>
        </ul>
      </div>
    </div>
  );
};

export default Contact;
