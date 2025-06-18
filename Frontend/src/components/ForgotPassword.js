import React, { useState } from "react";
import axios from "axios";

function ForgotPassword({ onOtpSent }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8080/api/auth/forgot-password", { email });
      setMessage(res.data.message || "OTP sent successfully!");
      onOtpSent(email);
    } catch (error) {
      setMessage(error.response?.data?.message || "Error sending OTP.");
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md max-w-md mx-auto mt-6">
  <h2 className="text-xl font-semibold mb-2">Forgot Password</h2>
  <form onSubmit={handleSubmit} className="space-y-3">
    <input
      type="email"
      placeholder="Enter your registered email"
      className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      required
    />
    <button className="w-full bg-blue-600 text-white py-1.5 rounded-md text-sm hover:bg-blue-700">
      Send OTP
    </button>
  </form>
  {message && <p className="text-xs text-green-600 mt-2">{message}</p>}
</div>

  );
}

export default ForgotPassword;
