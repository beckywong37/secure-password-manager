/*
This creates the Password Generator component using React.

Features:
- Allows user to generate a random password with customizable length and character types
- Displays the generated password in the UI
- Displays error messages if password generation fails

** GenAI Citation for Becky: **
Portions of this code related to refactoring Generator.tsx into seperate components were generated with
the help of ChatGPT-5. This included initial planning, prop types, and the useEffect hook.
The conversation transcript [ChatGPT-5 linked here](https://chatgpt.com/c/6907e346-dc74-8326-b5f8-bbb7cbc90dea)
documents the GenAI Interaction that led to my code.
*/

// Imports React and styles
import { useState } from 'react';
import {Button} from './Button';
import {Spacer} from './Spacer';
import styles from '../pages/Page.module.css';

// Props for the Password Generator component
// onPasswordGenerated: called when password successfully generated (string password) else void
// onError: called when an error occurs (string error message) else void
interface GeneratorProps {
  onPasswordGenerated: (password: string) => void;
  onError: (error: string) => void;
}

export default function Generator({ onPasswordGenerated, onError }: GeneratorProps) {
  // Set states for the Password Generator and configures default settings
  const [length, setLength] = useState(15);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [special, setSpecial] = useState(false);
  const [error, setError] = useState("");
  const [checkboxError, setCheckboxError] = useState("");

  // Runs when user clicks the "Generate Password" button
  async function hitGeneratePassword() {
    // Clear previous error before generating new password
    setError("");
    setCheckboxError("");
    onError("");

    // Error message if no options selected
    if (!uppercase && !lowercase && !numbers && !special) {
      const errorMsg = "Please select at least one character type";
      setCheckboxError(errorMsg);
      return;
    }

    try {
      // Makes POST request to Django backend endpoint to generate password (relative path)
      const response = await fetch("/generator/api/generate-password/", {
        method: "POST",
        headers: { "Content-Type": "application/json" }, // Tells server data is in JSON format
        body: JSON.stringify({length, uppercase, lowercase, numbers, special}),
      });
      // Django responds but bad request, setError to display error message in the UI
      if (!response.ok) {
        const errorMsg = `Server error: ${response.statusText}`;
        setError(errorMsg);
        onError(errorMsg);
        return;
      }
      // If POST request is successful, update React state with new password so it will display in UI
      const data = await response.json();
      const password = data.password;
      onPasswordGenerated(password);
    // Django server not responding, setError to display error message in the UI
    } catch {
      const errorMsg = 'Server not reachable. Check if Django is running and connected';
      setError(errorMsg);
      onError(errorMsg);
    }
  }

  return (
    <div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Character Length Slider */}
        <label style={{ marginBottom: 5 }}>
          Character Length: <strong>{length}</strong>
          <input
            type="range"
            value={length}
            onChange={(e) => setLength(parseInt(e.target.value))}
            min={4}
            max={128}
            style={{width: "100%", marginTop: 8, cursor: "pointer",
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8em", color: "lightgray", marginTop: 4 }}>
          </div>
        </label>

        {/* Create 2 columns for the checkboxes */}
        <div>
          <div
          style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: 10,
          }}
          >
            {/*Uppercase Checkbox */}
          <label>
            <input
              type="checkbox"checked={uppercase} onChange={() => {
                setUppercase(!uppercase);
                if (checkboxError) setCheckboxError("");
              }}
            /> Uppercase
          </label>

          {/* Lowercase Checkbox */}
          <label>
            <input
              type="checkbox" checked={lowercase} onChange={() => {
                setLowercase(!lowercase);
                if (checkboxError) setCheckboxError("");
              }}
            /> Lowercase
          </label>

          {/* Numbers Checkbox */}
          <label>
            <input
              type="checkbox"checked={numbers} onChange={() => {
                setNumbers(!numbers);
                if (checkboxError) setCheckboxError("");
              }}
            /> Numbers
          </label>

          {/* Special Characters Checkbox */}
          <label>
            <input
              type="checkbox" checked={special} onChange={() => {
                setSpecial(!special);
                if (checkboxError) setCheckboxError("");
              }}
            /> Special Characters
          </label>
          </div>
          {checkboxError && (
            <Spacer marginTop="sm">
              <div style={{ fontSize: "13px", color: "var(--color-error)" }}>
                {checkboxError}
              </div>
            </Spacer>
          )}
        </div>

        {/* Generate Password Button */}
        <Button
          onClick={hitGeneratePassword}
          variant="primary"
        >
          Generate Password
        </Button>

        {/* Display error message if password generation fails */}
        {error && (
          <Spacer marginTop="sm">
            <p style={{ color: "var(--color-error)" }}>{error}</p>
          </Spacer>
        )}
      </div>
    </div>
  );
}
