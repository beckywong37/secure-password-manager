/*
This is the RegistrationForm component for the Secure Password Manager web app.

Features:
- Username, email, password, and confirm password fields
- Registration button
- Error message display
- Switch to login form

Note:
- Have no backend API calls (UI only)

GenAI Citation for Becky:
Portions of this code related form card styling, link to toggle between login and registration view,
and input field styling were generated with the help of ChatGPT-5. 
The conversation transcript [ChatGPT-5 linked here](https://chatgpt.com/c/690aef41-c520-832a-8ef0-bd4cfe278a41)
documents the GenAI Interaction that led to my code.
*/

// Imports React and styles
import { useState } from 'react';
import {Button} from './Button';
import {Input} from './Input';
import {Spacer} from './Spacer';
import styles from '../pages/Page.module.css';

interface RegistrationFormProps {
    // onSwitchToLogin is a function from parent that switches view to login form
  onSwitchToLogin: () => void;
}

export default function RegistrationForm({ onSwitchToLogin}: RegistrationFormProps) {
    // State variables for form fields
    // Functions to update the values
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  // Runs when user submits registration form
  function submitRegistrationForm(e: React.FormEvent) {
    // Prevents page from reloading on submit
    e.preventDefault();
    setErrors({});

    const newErrors: typeof errors = {};

    // Check if all fields are filled out
    if (!username) newErrors.username = "Username is required";
    if (!email) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    if (!confirmPassword) newErrors.confirmPassword = "Please confirm your password";

    // Check if passwords match
    if (password && confirmPassword && password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // If there are any errors, set them and return
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // TODO: Backend integration API request will be added here
    // For now, just log the input to the console
    console.log("Registration form submitted:", { username, email, password });

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
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors({ ...errors, password: undefined });
          }}
          error={errors.password}
          required
        />
        <Input
          label="Confirm Password *"
          type="password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
          }}
          error={errors.confirmPassword}
          required
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

