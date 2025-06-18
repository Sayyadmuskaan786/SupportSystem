import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import AgentDashboard from './AgentDashboard';
import AdminDashboard from './AdminDashboard';
import CustomerDashboard from './CustomerDashboard';
import About from './About';
import Contact from './Contact';
import GoogleLoginButton from './components/GoogleLoginButton';
import ForgotPasswordFlow from './components/ForgotPasswordFlow';




function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');

  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('CUSTOMER');
  const [newEmail, setNewEmail] = useState('');

  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);

  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [otp, setOtp] = useState('');

  const [showForgotPasswordFlow, setShowForgotPasswordFlow] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserRole(data.role.toLowerCase());
        setToken(data.token);
        setUserId(data.userId);
        setIsLoggedIn(true);
        setPassword('');
      } else {
        alert('Login failed: Invalid credentials');
      }
    } catch (error) {
      alert('Login failed: ' + error.message);
    }
  };

  const handleLogout = () => {
    setEmail('');
    setPassword('');
    setUserRole(null);
    setIsLoggedIn(false);
    setShowCreateAccount(false);
    setToken(null);
    setUserId(null);
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/api/auth/register-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: newUsername,
          email: newEmail,
          password: newPassword,
          role: newUserRole,
        }),
      });
      if (response.ok) {
        alert('OTP sent to your email. Please verify.');
        setShowCreateAccount(false);
        setShowOtpForm(true);
        setOtpEmail(newEmail);
        setNewUsername('');
        setNewPassword('');
        setNewUserRole('CUSTOMER');
        setNewEmail('');
      } else {
        const errorText = await response.text();
        alert('Account creation failed: ' + errorText);
      }
    } catch (error) {
      alert('Account creation failed: ' + error.message);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/api/auth/verify-otpp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail, otp }),
      });
      if (response.ok) {
        alert('Verification successful! You can now log in.');
        setShowOtpForm(false);
        setOtp('');
        setOtpEmail('');
      } else {
        const errorText = await response.text();
        alert('OTP verification failed: ' + errorText);
      }
    } catch (error) {
      alert('OTP verification failed: ' + error.message);
    }
  };

  const handleResendOtp = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail }),
      });
      if (response.ok) {
        alert('OTP resent successfully. Please check your email.');
      } else {
        const errorText = await response.text();
        alert('Failed to resend OTP: ' + errorText);
      }
    } catch (error) {
      alert('Failed to resend OTP: ' + error.message);
    }
  };

  const handleGoogleLoginSuccess = (data) => {
    setUserRole(data.role.toLowerCase());
    setToken(data.token);
    setUserId(data.userId);
    setIsLoggedIn(true);
  };

  const handleGoogleLoginFailure = (error) => {
    alert('Google login failed: ' + error.message);
  };

  if (isLoggedIn) {
    let DashboardComponent = null;
    if (userRole === 'agent') DashboardComponent = AgentDashboard;
    else if (userRole === 'admin') DashboardComponent = AdminDashboard;
    else if (userRole === 'customer') DashboardComponent = CustomerDashboard;

    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold">Support System</div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition"
          >
            Logout
          </button>
        </nav>
        <main className="flex-grow">
          <DashboardComponent token={token} userId={userId} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold">Support System</div>
        <div className="space-x-6">
          <button onClick={() => { setShowCreateAccount(false); setCurrentPage('home'); setShowForgotPasswordFlow(false); }}>Home</button>
          <button onClick={() => { setShowForgotPasswordFlow(false); setCurrentPage('about'); }}>About</button>
          <button onClick={() => { setShowForgotPasswordFlow(false); setCurrentPage('contact'); }}>Contact</button>
          <button onClick={() => { setShowCreateAccount(false); setCurrentPage('home'); setShowForgotPasswordFlow(false); }}>Login</button>
        </div>
      </nav>

      <main className="flex-grow flex items-center justify-center">
        {showForgotPasswordFlow ? (
          <div className="bg-green p-5 rounded shadow-md w-full max-w-md flex flex-col items-center">
            <ForgotPasswordFlow />
            <button
              onClick={() => setShowForgotPasswordFlow(false)}
              className="mt-10 w-1/2 bg-gray-300 text-gray-700 py-2 mx-auto rounded hover:bg-gray-400 transition"
            >
              Back to Login
            </button>
          </div>
        ) : showOtpForm ? (
          <form onSubmit={handleVerifyOtp} className="bg-white p-8 rounded shadow-md w-full max-w-md flex flex-col items-center">
            <h2 className="text-2xl font-semibold mb-6 text-center">Verify OTP</h2>
            <div className="mb-4 w-full">
              <label htmlFor="otp" className="block mb-1 font-medium">Enter OTP sent to your email</label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
              Verify OTP
            </button>
            <p className="mt-4 text-center text-sm text-gray-600">
              Didn't get the OTP?{' '}
              <button
                type="button"
                onClick={handleResendOtp}
                className="text-blue-600 hover:underline"
              >
                Resend OTP
              </button>
            </p>
            {/* <button
              onClick={() => setShowForgotPasswordFlow(false)}
              className="mt-10 w-1/2 bg-gray-300 text-gray-700 py-2 mx-auto rounded hover:bg-gray-400 transition"
            >
              Back to Login
            </button> */}
          </form>
        ) : currentPage === 'home' && !showCreateAccount && !showOtpForm ? (
          <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
            <form onSubmit={handleLogin}>
              <h2 className="text-2xl font-semibold mb-6 text-center">Login</h2>
              <div className="mb-4">
                <label htmlFor="email" className="block mb-1 font-medium">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>
              <div className="mb-6">
                <label htmlFor="password" className="block mb-1 font-medium">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
              >
                Login
              </button>
            </form>

            <div className="my-6 text-center text-gray-500">OR</div>

            <div className="flex justify-center">
              <GoogleLoginButton
                onLoginSuccess={handleGoogleLoginSuccess}
                onLoginFailure={handleGoogleLoginFailure}
              />
            </div>

            <p className="mt-4 text-center text-sm text-gray-600">
              <button
                type="button"
                onClick={() => { setShowForgotPasswordFlow(true); setShowCreateAccount(false); setCurrentPage('home'); }}
                className="text-blue-600 hover:underline"
              >
                Forgot Password?
              </button>
            </p>
            <p className="mt-4 text-center text-sm text-gray-600">
              New user?{' '}
              <button
                type="button"
                onClick={() => setShowCreateAccount(true)}
                className="text-blue-600 hover:underline"
              >
                Create account
              </button>
            </p>
          </div>
      ) : currentPage === 'home' && showCreateAccount && !showOtpForm ? (
        <form onSubmit={handleCreateAccount} className="bg-white p-8 rounded shadow-md w-full max-w-md">
          <h2 className="text-2xl font-semibold mb-6 text-center">Create Account</h2>
          <div className="mb-4">
            <label htmlFor="newUsername" className="block mb-1 font-medium">Username</label>
            <input
              id="newUsername"
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
              minLength={3}
              maxLength={20}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="newEmail" className="block mb-1 font-medium">Email</label>
            <input
              id="newEmail"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="newPassword" className="block mb-1 font-medium">Password</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
              minLength={6}
            />
          </div>
          <div className="mb-6">
            <label htmlFor="newUserRole" className="block mb-1 font-medium">Role</label>
            <select
              id="newUserRole"
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="CUSTOMER">Employee</option>
              <option value="AGENT">Engineer</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Create Account
          </button>
          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => setShowCreateAccount(false)}
              className="text-blue-600 hover:underline"
            >
              Login
            </button>
          </p>
        </form>
      ) : currentPage === 'about' ? (
        <About />
      ) : currentPage === 'contact' ? (
        <Contact />
      ) : null}
      </main>
    </div>
  );
}

export default App;
