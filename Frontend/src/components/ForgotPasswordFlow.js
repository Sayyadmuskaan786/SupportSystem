import React, { useState } from "react";
import ForgotPassword from "./ForgotPassword";
import VerifyOtp from "./VerifyOtp";
import ResetPassword from "./ResetPassword";

function ForgotPasswordFlow() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");

  return (
    <div className="min-h-full bg-white-100 flex items-center justify-center">
      {step === 1 && <ForgotPassword onOtpSent={(email) => { setEmail(email); setStep(2); }} />}
      {step === 2 && <VerifyOtp email={email} onOtpVerified={() => setStep(3)} />}
      {step === 3 && <ResetPassword email={email} />}
    </div>
  );
}

export default ForgotPasswordFlow;
