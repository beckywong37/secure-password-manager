/*
This is the MFA Verification component for the Secure Password Manager web app.

Features:
- Accepts 6-digit code from authenticator app
- Submits code to backend for verification
- On success, retrieves JWT tokens to complete auth and navigates to vault
*/

// Imports React and styles
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../pages/Page.module.css";
import { apiRequest } from "../utils/http/apiRequest";

export default function MFAVerifyForm() {
  const [mfaCode, setMfaCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Runs when user submits form
  async function submitMFAForm(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!mfaCode || mfaCode.length !== 6) {
      setError("Please enter a valid 6-digit MFA code");
      return;
    }

    try {
      await apiRequest("/api/auth/mfa-verify/", {
        method: "POST",
        body: { mfa_code: mfaCode },
      });

      // Force SessionManager to run and redirect to /vault
      navigate("/mfa/verify?refresh", { replace: true });
      return;
  
    } catch (err: any) {
      // Return descriptive error response if available
      const errorResponse = err?.data?.error;
      const errorMessage = 
        errorResponse?.mfa_code ||
        errorResponse?.mfa_token ||
        typeof errorResponse === "string" ? errorResponse : "Unable to verify MFA code";

      setError(errorMessage);
    } finally {
      setMfaCode("");
    }
  }

  // JSX to render MFA Setup Form
  return (
    <>
      {/* Form card styling */}
      <div className={styles.formCard}>
        <h2>Verify Your MFA Code</h2>
        <p style={{ fontSize: "1.1em", color: "gray", marginBottom: 30, marginTop: 8 }}>
          Enter the 6-digit code from your authenticator app.
        </p>
      </div>

      <form onSubmit={submitMFAForm} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
        <div>
          <label className={styles.inputLabel}>6-Digit Code *</label>
          <input
            type="text"
            maxLength={6}
            value={mfaCode}
            onChange={(e) => setMfaCode(e.target.value)}
            className={styles.inputField}
            required
          />
        </div>

        {/* Display error message */}
        {error && (
          <p style={{ color: "red", fontSize: "0.9em", marginTop: -5 }}>
            {error}
          </p>
        )}

        <button type="submit" className={`${styles.button} ${styles.buttonPrimary}`}>
          Verify
        </button>
      </form>
    </>
  );
}
