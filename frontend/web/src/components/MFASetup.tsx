/*
This is the MFA Setup component for the Secure Password Manager web app.

Features:
- Fetches QR code for MFA setup from the backend
- Displays the QR code for scanning in an authenticator app
- Provides a button to continue to MFA verification page
*/

// Imports React and styles
import { useState, useEffect } from "react";
import styles from "../pages/Page.module.css";
import { ensureCSRFToken, getCookie } from "../utils/cookies";

interface MFASetupFormProps {
  onShowMFAVerify: () => void;
}

export default function MFASetupForm({ onShowMFAVerify }: MFASetupFormProps) {
  const [qrCode, setQrCode] = useState("");
  const [error, setError] = useState("");

  // Ensure CSRF cookie exists and fetch QR code after component is rendered
  useEffect(() => {
    ensureCSRFToken();
    getQRCode();
  }, []);

  async function getQRCode() {
    try {
      const csrfToken = getCookie("csrftoken");
      if (!csrfToken) {
        setError("Unable to retrieve CSRF token");
        return;
      }

      const response = await fetch("/auth/api/mfa-setup/", {
        method: "GET",
        credentials: "include",
        headers: {
          "X-CSRFToken": csrfToken,
        },
      });

      const data = await response.json();

      if (response.ok && data.qr_code) {
        setQrCode(data.qr_code);
      } else {
        console.error("MFA: Failed to load QR code: ", data);
        setError("Failed to load MFA QR code");
      }
    } catch (err) {
      console.error("MFA: Error fetching MFA QR code: ", err);
      setError("A network or server error occurred.");
    }
  }

  // JSX to render MFA Setup Form
  return (
    <>
      {/* Form card styling */}
      <div className={styles.formCard}>
        <h2>Set Up Multi-Factor Authentication</h2>
        <p
          style={{
            fontSize: "1.1em",
            color: "gray",
            marginBottom: 30,
            marginTop: 8,
          }}
        >
          Scan the QR code below using Google Authenticator or your favorite
          authentication app.
        </p>
      </div>

      <div style={{ textAlign: "center", marginBottom: 10 }}>
        {qrCode ? (
          <img
            src={qrCode}
            alt="MFA Setup QR Code"
            style={{ width: 200, height: 200 }}
          />
        ) : (
          <p style={{ color: "gray" }}>Loading QR code...</p>
        )}

        {/* Display error message */}
        {error && (
          <p style={{ color: "red", fontSize: "0.9em", marginTop: -5 }}>
            {error}
          </p>
        )}
      </div>

      <button
        type="submit"
        className={`${styles.button} ${styles.buttonPrimary}`}
        style={{ textAlign: "center", width: "100%" }}
        onClick={onShowMFAVerify}
      >
        Continue to MFA Verification
      </button>
    </>
  );
}
