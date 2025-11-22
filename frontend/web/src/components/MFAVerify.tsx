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
import { useVaultKey } from '../contexts/useVaultKey';
import { Button } from './Button';
import { Input } from './Input';
import { Spacer } from './Spacer';

type MFAVerifySuccessResponse = {
  access: string;
  refresh: string;
  vault_key: string;  // hex-encoded vault key from backend
};

type MFAVerifyErrorResponse = {
  error?: string | Record<string, string[]>;
  detail?: string | Record<string, string[]>;
};

export type MFAVerifyResponse = 
  | MFAVerifySuccessResponse
  | MFAVerifyErrorResponse;



export default function MFAVerifyForm() {
  const [mfaCode, setMfaCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setVaultKey } = useVaultKey();

  // Runs when user submits form
  async function submitMFAForm(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!mfaCode || mfaCode.length !== 6) {
      setError("Please enter a valid 6-digit MFA code");
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiRequest<MFAVerifyResponse>("/api/auth/mfa-verify/", {
        method: "POST",
        body: { mfa_code: mfaCode },
        suppressErrors: true
      });

      // Return descriptive error message if necessary
      const status = response?.status ?? 200;
      if (status !== 200) {
        let errorResponse = (response.data as MFAVerifyErrorResponse)?.detail || (response.data as MFAVerifyErrorResponse)?.error || response.message;

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

      // Store vault key in context for encryption/decryption
      const successData = response.data as MFAVerifySuccessResponse;
      if (successData.vault_key) {
        setVaultKey(successData.vault_key);
      }

      // Force SessionManager to run and redirect to /vault
      navigate("/mfa/verify?refresh", { replace: true });
      return;
  
    } catch {
      setError("A network or server error occurred");

    } finally {
      setIsLoading(false);
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
          <Button type="submit" variant="primary" fluid isLoading={isLoading}>
            Verify
          </Button>
        </Spacer>
      </form>
    </>
  );
}
