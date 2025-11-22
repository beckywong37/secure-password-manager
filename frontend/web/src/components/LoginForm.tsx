/*
This is the Login Form component for the Secure Password Manager web app.

Features:
- Username/Email and password fields
- Login button
- Error message display
- Switch to registration form

GenAI Citation for Becky:
Portions of this code related form card styling, link to toggle between login and registration view,
and input field styling were generated with the help of ChatGPT-5. 
The conversation transcript [ChatGPT-5 linked here](https://chatgpt.com/c/690aef41-c520-832a-8ef0-bd4cfe278a41)
documents the GenAI Interaction that led to my code.

GenAI Citation for April:
Portions of this code was generated/refactored with the help of Cursor with the Claude-4.5-sonnet model
The conversation in the file below documents the GenAI Interaction that led to my code.
../GenAI_transcripts/2025_11_15_Cursor_refactor_UI.md
../GenAI_transcripts/2025_11_14_Cursor_style_Vault_components.md
*/

// Imports React and styles
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {Button} from './Button';
import {Input} from './Input';
import {Spacer} from './Spacer';
import styles from "../pages/Page.module.css";
import { apiRequest } from "../utils/http/apiRequest";

type LoginResponse = {
  // True if user requires MFA verification (MFA device already setup)
  is_mfa_setup?: boolean;
  // True if user needs to enroll in MFA first (no device yet)
  mfa_required?: boolean; // matches RecordDetails on 403
  message?: string;
  // Username is often echoed back by the backend for confirmation
  username?: string;
  // Data required for vault key (optional)
  vault_key?: string;
  // error details
  error?: string | Record<string, string[]>;
  // Django REST: non_field_errors or field errors
  detail?: string | Record<string, string[]>;
};

interface LoginFormProps {
  // onSwitchToRegister is a function from parent that switches view to registration form
  onSwitchToRegister: () => void;
}

export default function LoginForm({onSwitchToRegister,}: LoginFormProps) {
  // username and password variables store the user's input
  // setUsername and setPassword are functions that update the values
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Runs when user submits login form
  async function submitLoginForm(e: React.FormEvent) {
    // Prevents page from reloading on submit
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Check if all fields are filled out, if not, set error message
    if (!username || !password) {
      setError("All fields must be filled out");
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiRequest<LoginResponse>("/api/auth/login/", {
        method: "POST",
        body: {username, password},
        suppressErrors: true,  // allows 403 for when mfa setup is required
      });

      // Return descriptive error message if necessary
      const status = response?.status ?? 200;
      if (status !== 200 && !(status === 403 && response?.data?.mfa_required)) {
        let errorResponse = response.data?.detail || response.data?.error || response.message;

        if (typeof errorResponse === "object") {
          const firstKey = Object.keys(errorResponse)[0];
          const firstMessage = errorResponse[firstKey][0];
          errorResponse = firstMessage;
        }

        if (!errorResponse) {
          errorResponse = "Login failed";
        }

        setError(errorResponse);
        return;
      }

      // Force SessionManager to run and redirect
      navigate("/login?refresh", { replace: true });
      return;

    } catch {
      setError("A network or server error occurred");
    
    } finally {
      setIsLoading(false);
      setPassword("");
    }
  }

  // JSX to render Login Form
  return (
    <>
      {/* Form card styling */}
      <div className={styles.formCard}>
        <h2>Welcome Back to Secure Password Manager</h2>
        <Spacer marginTop="sm" marginBottom="xl">
          <p style={{ fontSize: "1.1em", color: "gray" }}>
            Sign in to your account
          </p>
        </Spacer>
      </div>
      
      <form onSubmit={submitLoginForm} style={{ display: "flex", flexDirection: "column" }}>
        <Input
          label="Username or Email *"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <Input
          label="Password *"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* Display error message */}
        {error && (
          <p style={{ color: "var(--color-error)", fontSize: "0.9em" }}>
            {error}
          </p>
        )}
        <Spacer marginTop="sm">
          <Button type="submit" variant="primary" fluid isLoading={isLoading}>
            Login
          </Button>
        </Spacer>
      </form>

      <Spacer marginTop="lg">
        <p style={{ textAlign: "center", color: "gray", fontSize: "0.95em" }}>
          Create an account here{" "}
          <Button
            onClick={onSwitchToRegister}
            variant="link"
          >
            Register New Account
          </Button>
        </p>
      </Spacer>
    </>
  );
}
