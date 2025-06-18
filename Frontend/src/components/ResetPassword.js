// src/components/ResetPassword.jsx

import React, { useState } from "react";
import axios from "axios";

function ResetPassword({ email }) {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8080/api/auth/reset-password", {
        email,
        newPassword: password,
      });
      setMessage(res.data.message || "Password reset successful.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Error resetting password.");
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md max-w-md mx-auto mt-6">
      <h2 className="text-xl font-semibold mb-2">Reset Password</h2>
      <form onSubmit={handleReset} className="space-y-3">
        <input
          type="password"
          placeholder="New password"
          className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="w-full bg-blue-600 text-white py-1.5 rounded-md text-sm hover:bg-blue-700">
          Reset
        </button>
      </form>
      {message && <p className="text-xs text-green-600 mt-2">{message}</p>}
    </div>
  );
}

export default ResetPassword;
