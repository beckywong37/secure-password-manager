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

GenAI Citation for April:
Portions of this code was generated/refactored with the help of Cursor with the Claude-4.5-sonnet model
The conversation in the file below documents the GenAI Interaction that led to my code.
../GenAI_transcripts/2025_11_15_Cursor_refactor_UI.md
../GenAI_transcripts/2025_11_14_Cursor_style_Vault_components.md
*/

// Imports React and styles
import { useState, type FC } from "react";
import { useNavigate } from "react-router-dom";
import {Button} from './Button';
import {Input} from './Input';
import {Spacer} from './Spacer';
import styles from "../pages/Page.module.css";
import { apiRequest, type ApiResponse } from "../utils/http/apiRequest";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

// Types for /api/auth/register/ response (from views.py logic)

export interface RegisterSuccessResponse {
  id: number;
  username: string;
  email: string;
  // The backend may include other fields, e.g., date_joined, etc.
  // MFA handling fields:
  is_mfa_setup: boolean;
  message: string;
}

export interface RegisterErrorResponse {
  detail: Record<string, string[]>;
  error: string | { [field: string]: string[] }; // DRF error detail can be field errors or a general error string
}

// Union type for the fetch return type of registration:
export type RegisterResponse = RegisterSuccessResponse | RegisterErrorResponse;

interface PasswordToggleButtonProps {
    showPassword: boolean;
    onToggle: () => void;
}

const PasswordToggleButton: FC<PasswordToggleButtonProps> = ({ showPassword, onToggle }) => (
    <button
        type="button"
        style={{ 
          background: 'none', 
          border: 'none', 
          cursor: 'pointer',
          padding: '0.5rem',
          color: 'var(--color-text-secondary, gray)'
        }}
        onClick={onToggle}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
    >
        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
    </button>
);

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  const navigate = useNavigate();

  // Runs when user submits registration form
  async function submitRegistrationForm(e: React.FormEvent) {
    // Prevents page from reloading on submit
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    const newErrors: typeof errors = {};

    // Check if all fields are filled out
    if (!username) newErrors.username = "Username is required";
    if (!email) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    if (!password2) newErrors.confirmPassword = "Please confirm your password";

    // Check if passwords match
    if (password && password2 && password !== password2) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // If there are any errors, set them and return
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      await apiRequest<RegisterResponse>("/api/auth/register/", {
        method: "POST",
        body: {username, email, password, password2},
      });

      // Force SessionManager to run and redirect to /mfa/setup
      navigate("/login?refresh", { replace: true });
      return;

    } catch (err) {
      // Return descriptive error response if available
      let errorResponse: string | Record<string, string[]> = (err as ApiResponse<RegisterErrorResponse>).data?.detail || (err as ApiResponse<RegisterErrorResponse>).data?.error || (err as ApiResponse<RegisterErrorResponse>).message;

      if (typeof errorResponse === "object") {
        const firstKey = Object.keys(errorResponse)[0];
        const firstMessage = errorResponse[firstKey][0];
        errorResponse = firstMessage;
      }

      if (!errorResponse) {
        errorResponse = "A network or server error occurred";
      }

      setErrors({ general: errorResponse });
      return;

    } finally {
      setIsLoading(false);
      setPassword("");
      setPassword2("");
    }
  }

  // JSX to render Registration Form
  return (
    <>
      <div className={styles.formCard}>
        <h2>Create a New Account</h2>
        <Spacer marginTop="sm" marginBottom="xl">
          <p style={{ fontSize: "1em", color: "gray" }}>
            To register provide the following information
          </p>
        </Spacer>
      </div>

      <form onSubmit={submitRegistrationForm} style={{ display: "flex", flexDirection: "column" }}>
        <Input
          label="Username *"
          type="text"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            if (errors.username) setErrors({ ...errors, username: undefined });
          }}
          error={errors.username}
          required
        />
        <Input
          label="Email *"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors({ ...errors, email: undefined });
          }}
          error={errors.email}
          required
        />
        <Input
          label="Password *"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors({ ...errors, password: undefined });
          }}
          error={errors.password}
          required
          secondaryRightAdornment={
            <PasswordToggleButton 
              showPassword={showPassword}
              onToggle={() => setShowPassword(!showPassword)}
            />
          }
        />
        <Input
          label="Confirm Password *"
          type={showConfirmPassword ? "text" : "password"}
          value={password2}
          onChange={(e) => {
            setPassword2(e.target.value);
            if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
          }}
          error={errors.confirmPassword}
          required
          secondaryRightAdornment={
            <PasswordToggleButton 
              showPassword={showConfirmPassword}
              onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
            />
          }
        />

        {/* Display general error message if needed */}
        {errors.general && (
          <p style={{ color: "var(--color-error)", fontSize: "0.9em" }}>{errors.general}</p>
        )}

        <Spacer marginTop="sm">
          <Button
            type="submit"
            variant="primary"
            fluid
            isLoading={isLoading}
          >
            Register
          </Button>
        </Spacer>
      </form>

      <Spacer marginTop="lg">
        <p style={{ textAlign: "center", color: "gray", fontSize: "0.95em" }}>
          Already have an account with us?{" "}
          <Button
            onClick={onSwitchToLogin}
            variant="link"
          >
            Login here
          </Button>
        </p>
      </Spacer>
    </>
  );
}
