/*
This is the RegistrationForm component for the Secure Password Manager web app.

Features:
- Username, email, password, and confirm password fields
- Registration button
- Error message display
- Switch to login form
- Proceed to MFA setup

GenAI Citation for Becky:
Portions of this code related form card styling, link to toggle between login and registration view,
and input field styling were generated with the help of ChatGPT-5. 
The conversation transcript [ChatGPT-5 linked here](https://chatgpt.com/c/690aef41-c520-832a-8ef0-bd4cfe278a41)
documents the GenAI Interaction that led to my code.
*/

// Imports React and styles
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../pages/Page.module.css";
import { apiRequest } from "../utils/http/apiRequest";

interface RegistrationFormProps {
  // onSwitchToLogin is a function from parent that switches view to login form
  onSwitchToLogin: () => void;
}

export default function RegistrationForm({ onSwitchToLogin }: RegistrationFormProps) {
  // State variables for form fields
  // Functions to update the values
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Runs when user submits registration form
  async function submitRegistrationForm(e: React.FormEvent) {
    // Prevents page from reloading on submit
    e.preventDefault();
    setError("");

    // Check if passwords match, if not, set error message
    if (password !== password2) {
      setError("Passwords do not match");
      return;
    }

    // Check if all fields are filled out, if not, set error message
    if (!username || !email || !password || !password2) {
      setError("All fields must be filled out");
      return;
    }

    try {
      await apiRequest("/api/auth/register/", {
        method: "POST",
        body: {username, email, password, password2},
      });

      // Force SessionManager to run and redirect to /mfa/setup
      navigate("/login?refresh", { replace: true });
      return;

    } catch (err: any) {
      // Return descriptive error response if available
      const errorResponse = err?.data;
      const errorMessage = 
        errorResponse.error?.username[0] ||
        errorResponse.error?.email[0] ||
        errorResponse.error.password[0] ||
        errorResponse.error.non_field_errors[0] ||
        "A network or server error occurred";

      setError(errorMessage);    
    } finally {
      setPassword("");
      setPassword2("");
    }
  }

  // JSX to render Registration Form
  return (
    <>
      <div className={styles.formCard}>
        <h2>Create a New Account</h2>
        <p style={{ fontSize: "1em", color: "gray", marginBottom: 30, marginTop: 8 }}>
          To register provide the following information
        </p>
      </div>

      <form onSubmit={submitRegistrationForm} style={{ display: "flex", flexDirection: "column", gap: 15 }} >
        <div>
          <label className={styles.inputLabel}>Username *</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={styles.inputField}
            required
          />
        </div>

        <div>
          <label className={styles.inputLabel}>Email *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.inputField}
            required
          />
        </div>

        <div>
          <label className={styles.inputLabel}>Password *</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.inputField}
            required
          />
        </div>

        <div>
          <label className={styles.inputLabel}>Confirm Password *</label>
          <input
            type="password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
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

        <button type="submit" className={`${styles.button} ${styles.buttonPrimary}`} style={{ marginTop: 10, width: "100%" }}>
          Register
        </button>
      </form>

      <p style={{ marginTop: 24, textAlign: "center", color: "gray", fontSize: "0.95em" }}>
        Already have an account with us?{" "}
        <button
          onClick={onSwitchToLogin}
          style={{
            color: "#007bff",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          Login here
        </button>
      </p>
    </>
  );
}
