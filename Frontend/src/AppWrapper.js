import React, { useState, useEffect } from 'react';
import App from './App';
import ResetPassword from './ResetPassword';
import ResetPasswordOtp from './ResetPasswordOtp';

function AppWrapper() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const onLocationChange = () => {
      setPath(window.location.pathname);
    };
    window.addEventListener('popstate', onLocationChange);
    return () => {
      window.removeEventListener('popstate', onLocationChange);
    };
  }, []);

  if (path === '/reset-password') {
    return <ResetPassword />;
  }

  if (path === '/reset-password-otp') {
    return <ResetPasswordOtp />;
  }

  return <App />;
}

export default AppWrapper;
