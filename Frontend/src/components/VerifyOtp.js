import React, { useState } from "react";
import axios from "axios";

function VerifyOtp({ email, onOtpVerified }) {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8080/api/auth/verify-otp", {
        email,
        otp,
      });
      setMessage(res.data.message || "OTP verified successfully!");
      onOtpVerified();
    } catch (error) {
      setMessage(error.response?.data?.message || "Error verifying OTP.");
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md max-w-md mx-auto mt-6">
      <h2 className="text-xl font-semibold mb-2">Verify OTP</h2>
      <form onSubmit={handleVerify} className="space-y-3">
        <input
          type="text"
          placeholder="Enter OTP"
          className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />
        <button className="w-full bg-blue-600 text-white py-1.5 rounded-md text-sm hover:bg-blue-700">
          Verify
        </button>
      </form>
      {message && <p className="text-xs text-green-600 mt-2">{message}</p>}
    </div>
  );
}

export default VerifyOtp;
