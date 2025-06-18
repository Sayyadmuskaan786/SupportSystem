import React from 'react';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-100 via-white to-gray-100 flex items-center justify-center p-8">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl p-12 border border-gray-200">
        <h1 className="text-5xl font-bold text-center text-gray-900 mb-8">About Our Support System</h1>
        <p className="text-lg text-gray-700 mb-6">
          Welcome to our Support System, a comprehensive platform designed to streamline customer support and enhance communication between customers and support agents.
        </p>
        <p className="text-lg text-gray-700 mb-6">
          Our system allows customers to create support tickets, track their status, and communicate directly with support agents through an integrated commenting feature. Agents can efficiently manage and resolve tickets, ensuring timely assistance.
        </p>
        <p className="text-lg text-gray-700 mb-6">
          Key features include:
          <ul className="list-disc list-inside mt-3 text-gray-700 space-y-1">
            <li>Secure user authentication and role-based access control</li>
            <li>Real-time ticket assignment and state updates</li>
            <li>Email notifications for ticket assignments and resolutions</li>
            <li>Integrated communication between customers and agents</li>
            <li>Responsive and user-friendly interface</li>
          </ul>
        </p>
        <p className="text-lg text-gray-700">
          We are committed to providing an exceptional support experience. Thank you for choosing our platform!
        </p>
      </div>
    </div>
  );
};

export default About;
