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

GenAI Citation for April:
Portions of this code was generated/refactored with the help of Cursor with the Claude-4.5-sonnet model
The conversation in the file below documents the GenAI Interaction that led to my code.
../GenAI_transcripts/2025_11_15_Cursor_refactor_UI.md
../GenAI_transcripts/2025_11_14_Cursor_style_Vault_components.md
*/

// Imports React and styles
import { useState } from 'react';
import {Button} from './Button';
import {Input} from './Input';
import {Spacer} from './Spacer';
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
        <Button type="submit" variant="primary">
          Login
        </Button>
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

