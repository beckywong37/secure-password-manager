/*
This is the Login Form component for the Secure Password Manager web app.

Features:
- Username/Email and password fields
- Login button
- Error message display
- Switch to registration form
- Proceed to MFA setup or verification

GenAI Citation for Becky:
Portions of this code related form card styling, link to toggle between login and registration view,
and input field styling were generated with the help of ChatGPT-5. 
The conversation transcript [ChatGPT-5 linked here](https://chatgpt.com/c/690aef41-c520-832a-8ef0-bd4cfe278a41)
documents the GenAI Interaction that led to my code.
*/

// Imports React and styles
import { useState } from "react";
import styles from "../pages/Page.module.css";
import { getCookie } from "../utils/cookies";

interface LoginFormProps {
  // onSwitchToRegister is a function from parent that switches view to registration form
  onSwitchToRegister: () => void;
  onShowMFASetup: () => void;
  onShowMFAVerify: () => void;
}

export default function LoginForm({
  onSwitchToRegister,
  onShowMFASetup,
  onShowMFAVerify,
}: LoginFormProps) {
  // username and password variables store the user's input
  // setUsername and setPassword are functions that update the values
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Runs when user submits login form
  async function submitLoginForm(e: React.FormEvent) {
    // Prevents page from reloading on submit
    e.preventDefault();
    setError("");

    // Check if all fields are filled out, if not, set error message
    if (!username || !password) {
      setError("All fields must be filled out");
      return;
    }

    try {
      const csrfToken = getCookie("csrftoken");
      if (!csrfToken) {
        setError("Unable to retrieve CSRF token");
        return;
      }

      const response = await fetch("/api/auth/login/", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.is_mfa_setup) {
        console.log("Auth: MFA verification required:", data);
        onShowMFAVerify();
        setUsername("");
      } else if (response.status === 403 && !data.is_mfa_setup) {
        console.log("Auth: MFA setup required:", data);
        onShowMFASetup();
        setUsername("");
      } else {
        console.error("Auth: Error:", data);
        setError("Authentication error");
      }
    } catch (err) {
      console.error("Auth: Error", err);
      setError("A network or server error occurred.");
    } finally {
      setPassword("");
    }
  }

  // JSX to render Login Form
  return (
    <>
      {/* Form card styling */}
      <div className={styles.formCard}>
        <h2>Welcome Back to Secure Password Manager</h2>
        <p
          style={{
            fontSize: "1.1em",
            color: "gray",
            marginBottom: 30,
            marginTop: 8,
          }}
        >
          Sign in to your account
        </p>
      </div>

      <form
        onSubmit={submitLoginForm}
        style={{ display: "flex", flexDirection: "column", gap: 15 }}
      >
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
          <label className={styles.inputLabel}>Password *</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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

        <button
          type="submit"
          className={`${styles.button} ${styles.buttonPrimary}`}
        >
          Login
        </button>
      </form>

      <p
        style={{
          marginTop: 24,
          textAlign: "center",
          color: "gray",
          fontSize: "0.95em",
        }}
      >
        Create an account here{" "}
        <button
          onClick={onSwitchToRegister}
          style={{
            color: "#007bff",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          Register New Account
        </button>
      </p>
    </>
  );
}
