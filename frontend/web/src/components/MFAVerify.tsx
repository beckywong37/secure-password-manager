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
import { Button } from './Button';
import { Input } from './Input';
import { Spacer } from './Spacer';

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
      const response = await apiRequest("/api/auth/mfa-verify/", {
        method: "POST",
        body: { mfa_code: mfaCode },
        suppressErrors: true
      });

      // Return descriptive error message if necessary
      const status = response?.status ?? 200;
      if (status !== 200) {
        let errorResponse = response.data?.detail || response.data?.error || response.message;

        if (typeof errorResponse === "object") {
          const firstKey = Object.keys(errorResponse)[0];
          const firstMessage = errorResponse[firstKey][0];
          errorResponse = firstMessage;
        }

        if (!errorResponse) {
          errorResponse = "MFA Verification failed";
        }

        setError(errorResponse);
        return;
      }

      // Force SessionManager to run and redirect to /vault
      navigate("/mfa/verify?refresh", { replace: true });
      return;
  
    } catch {
      setError("A network or server error occurred");

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
        <Spacer marginTop="sm" marginBottom="xl">
          <p style={{ fontSize: "1.1em", color: "gray" }}>
            Enter the 6-digit code from your authenticator app.
          </p>
        </Spacer>
      </div>

      <form onSubmit={submitMFAForm} style={{ display: "flex", flexDirection: "column" }}>
        <Input
          label="6-Digit Code *"
          type="text"
          maxLength={6}
          value={mfaCode}
          onChange={(e) => {
            setMfaCode(e.target.value);
            if (error) setError("");
          }}
          error={error}
          required
        />

        <Spacer marginTop="sm">
          <Button type="submit" variant="primary" fluid>
            Verify
          </Button>
        </Spacer>
      </form>
    </>
  );
}
