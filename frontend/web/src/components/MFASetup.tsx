/*
This is the MFA Setup component for the Secure Password Manager web app.

Features:
- Fetches QR code for MFA setup from the backend
- Displays the QR code for scanning in an authenticator app
- Provides a button to continue to MFA verification page
*/

// Imports React and styles
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../pages/Page.module.css";
import { apiRequest } from "../utils/http/apiRequest";
import { Button } from './Button';
import { Spacer } from './Spacer';

export default function MFASetupForm() {
  const [qrCode, setQrCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Fetch QR code after component is rendered
  useEffect(() => {
    getQRCode();
  }, []);

  async function getQRCode() {
    try {
      const response = await apiRequest("/api/auth/mfa-setup/", {
        method: "POST",
      });

      if (response.qr_code) {
        setQrCode(response.qr_code);
        return;
      }

      setError("Failed to load MFA QR code");
      
    } catch (err: any) {
      // Return descriptive error response if available
      const errorResponse = err?.data?.error?.mfa_token;
      setError(errorResponse || "A network or server error occurred.");
    }
  }

  // JSX to render MFA Setup Form
  return (
    <>
      {/* Form card styling */}
      <div className={styles.formCard}>
        <h2>Set Up Multi-Factor Authentication</h2>
        <Spacer marginTop="sm" marginBottom="xl">
          <p style={{ fontSize: "1.1em", color: "gray" }}>
            Scan the QR code below using Google Authenticator or your favorite authentication app.
          </p>
        </Spacer>
      </div>

      <Spacer marginBottom="md">
        <div style={{ textAlign: "center" }}>
          {qrCode ? (
            <img src={qrCode} alt="MFA Setup QR Code" style={{ width: 200, height: 200 }} />
          ) : (
            <p style={{ color: "gray" }}>Loading QR code...</p>
          )}

          {/* Display error message */}
          {error && (
            <Spacer marginTop="sm">
              <p style={{ color: "var(--color-error)", fontSize: "0.9em" }}>
                {error}
              </p>
            </Spacer>
          )}
        </div>
      </Spacer>

      <Button
        variant="primary"
        fluid
        onClick={() => navigate("/mfa/verify")}
      >
        Continue to MFA Verification
      </Button>
    </>
  );
}
