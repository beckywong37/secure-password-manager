/*
This is the Login Form component for the Secure Password Manager web app.

Features:
- Username/Email and password fields
- Login button
- Switch to registration form

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
import styles from '../pages/Page.module.css';

interface LoginFormProps {
    // onSwitchToRegister is a function from parent that switches view to registration form
  onSwitchToRegister: () => void;
}

export default function LoginForm({ onSwitchToRegister }: LoginFormProps) {
    // username and password variables store the user's input
    // setUsername and setPassword are functions that update the values
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Runs when user submits login form 
  function submitLoginForm(e: React.FormEvent) {
    // Prevents page from reloading on submit
    e.preventDefault();
    // TODO: Backend integration API request will be added here
    // For now, just log the input to the console
    console.log("Login form submitted:", { username, password });
  }


  // JSX to render Login Form
  return (
    <>
    {/* Form card styling */}
      <div className={styles.formCard}>
        <h2>Welcome Back to Secure Password Manager</h2>
        <p style={{ fontSize: "1.1em", color: "gray", marginBottom: 30, marginTop: 8 }}>
          Sign in to your account
        </p>
      </div>
      
      <form onSubmit={submitLoginForm} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
        <div>
          <label className={styles.inputLabel}>
            Username or Email *
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={styles.inputField}
            required
          />
        </div>

        <div>
          <label className={styles.inputLabel}>
            Password *
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.inputField}
            required
          />
        </div>

        <Button type="submit" variant="primary">
          Login
        </Button>
      </form>

      <p style={{ marginTop: 24, textAlign: "center", color: "gray", fontSize: "0.95em" }}>
        Create an account here{" "}
        <Button
          onClick={onSwitchToRegister}
          variant="tertiary"
          style={{
            textDecoration: "underline",
            padding: "0",
            fontSize: "inherit",
            fontWeight: "normal",
          }}
        >
          Register New Account
        </Button>
      </p>
    </>
  );
}

