import React from 'react';
import { GoogleLogin } from '@react-oauth/google';

const GoogleLoginButton = ({ onLoginSuccess, onLoginFailure }) => {
  const handleLoginSuccess = async (credentialResponse) => {
    try {
      const idToken = credentialResponse.credential;

      const response = await fetch('http://localhost:8080/api/auth/google-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ idToken })  // Send as JSON object with idToken field
      });

      if (!response.ok) throw new Error('Google login failed');

      const data = await response.json();
      localStorage.setItem('token', data.token);
      onLoginSuccess(data);
    } catch (error) {
      console.error(error);
      onLoginFailure(error);
    }
  };

  // Helper function to get token from localStorage
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // Example of making an authenticated API call with the token
  const fetchProtectedData = async () => {
    const token = getToken();
    if (!token) {
      console.error('No token found');
      return;
    }
    try {
      const response = await fetch('http://localhost:8080/api/protected-endpoint', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch protected data');
      const data = await response.json();
      console.log('Protected data:', data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <GoogleLogin
        onSuccess={handleLoginSuccess}
        onError={() => onLoginFailure(new Error('Google login failed'))}
        // useOneTap removed to prevent repeated login refresh issue
      />
      {/* Example button to test authenticated API call */}
      {/* <button onClick={fetchProtectedData}>Fetch Protected Data</button> */}
    </>
  );
};

export default GoogleLoginButton;
