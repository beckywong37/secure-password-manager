/*
This creates the Password Strength Calculator component using React.

Features:
- Allows user to manually check the strength of any password
- Displays strength score, visual indicator, and recommendations
- Auto-checks password strength when a password is generated

** GenAI Citation for Becky: **
Portions of this code related to refactoring Generator.tsx into seperate components were generated with
the help of ChatGPT-5. This included initial planning, prop types, and the useEffect hook.
The conversation transcript [ChatGPT-5 linked here](https://chatgpt.com/c/6907e346-dc74-8326-b5f8-bbb7cbc90dea)
documents the GenAI Interaction that led to my code.
*/

// Imports React and styles
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import {Button} from './Button';
import {Input} from './Input';
import {Spacer} from './Spacer';
import styles from '../pages/Page.module.css';

// Data returned by Password Strength Calculator
interface PasswordStrengthResult {
  score: number;
  strength: "Strong" | "Moderate" | "Weak";
  notes: string[];
}

// If password is provided, auto-check password strength
// passwordToAutoCheck: password to check strength (string password) else undefined
interface StrengthCalculatorProps {
    passwordToAutoCheck?: string;
}

export default function PasswordStrengthCalculator({ 
    passwordToAutoCheck 
}: StrengthCalculatorProps) {
  // Sets states for the Password Strength Calculator
  const [checkPassword, setCheckPassword] = useState("");
  const [strengthData, setStrengthData] = useState<PasswordStrengthResult | null>(null);
  const [strengthError, setStrengthError] = useState("");
  const [isCheckingStrength, setIsCheckingStrength] = useState(false);

  // automatically checks password strength when new password is passed in as prop
  useEffect(() => {
    // If passToAutoCheck is passed in and its different from checkPassword, autocheck strength
    if (passwordToAutoCheck && passwordToAutoCheck !== checkPassword) {
      checkPasswordStrength(passwordToAutoCheck);
      // Also update the input field
      setCheckPassword(passwordToAutoCheck);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passwordToAutoCheck]);

  // Runs when user clicks the "Check Strength" button or when password is generated
  async function checkPasswordStrength(passwordToCheck: string) {
    // Clears previous error and strength data before checking new password
    setStrengthError("");
    setIsCheckingStrength(true);
    setStrengthData(null);

    try {
      // Makes POST request to Django backend endpoint to check password strength (relative path)
      const response = await fetch("/generator/api/check-strength/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: passwordToCheck
        }),
      });
      // Django responds but bad request, setStrengthError to display error message in the UI
      if (!response.ok) {
        setStrengthError(`Server error: ${response.statusText}`);
        return;
      } 
      // If POST request is successful, update React state with strength data so it will display in UI
      const data = await response.json();
      setStrengthData(data);
    // Django server not responding, setStrengthError to display error message in the UI
    } catch (err) {
      setStrengthError("Server not reachable. Check if Django is running and connected");
    } finally {
      // Always reset loading state, even if there's an error
      setIsCheckingStrength(false);
    }
  }

  // Function to get the color of the strength based on the strength level
  function getStrengthColor(strength: string) {
    switch (strength) {
      case "Strong": return "green";
      case "Moderate": return "orange";
      case "Weak": return "red";
      default: return "gray";
    }
  }

  return (
    <div style={{ marginTop: 20, paddingTop: 20, borderTop: "2px solid lightgray" }}>
      <h3>Password Strength Calculator</h3>
      <p style={{ fontSize: "1em", color: "gray", marginBottom: 15 }}>
        Check the strength of any password
      </p>
      {/* Input field for password to check */}
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <Input
            type="text"
            value={checkPassword}
            onChange={(e) => {
              setCheckPassword(e.target.value);
              if (strengthError) setStrengthError("");
            }}
            placeholder="Enter password to check strength"
            error={strengthError}
          />
        </div>
        {/* Check Strength Button */}
        {/* If password is empty, disable button */}
        <Button
          onClick={() => checkPasswordStrength(checkPassword)}
          disabled={isCheckingStrength || !checkPassword}
          variant="primary"
        >
          {isCheckingStrength ? "Checking..." : "Check Strength"}
        </Button>
      </div>

      {/* Display strength data container*/}
      {strengthData && (
        <div
          style={{marginTop: 15, padding: 15, background: "white", borderRadius: 8,
            border: `2px solid ${getStrengthColor(strengthData.strength)}`,
          }}
        >
          {/* Display strength data */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <strong>Strength:</strong>
            <span
              style={{
                padding: "2px 12px", borderRadius: 12,
                backgroundColor: getStrengthColor(strengthData.strength),
                color: "white", fontSize: "1em", fontWeight: "bold",
              }}
            >
              {strengthData.strength}
            </span>
            <span style={{ marginLeft: "auto", fontSize: "1em", color: "gray" }}>
              Score: {strengthData.score}/10
            </span>
          </div>

          {/* Score Bar */}
          <div
            style={{
              width: "100%", height: 8, backgroundColor: "lightgray",
              borderRadius: 4, marginBottom: 15, overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${(strengthData.score / 10) * 100}%`, height: "100%",
                backgroundColor: getStrengthColor(strengthData.strength),
                transition: "width 0.3s ease",
              }}
            />
          </div>
          {/* If backend sends suggestions, display notes */}
          {strengthData.notes && strengthData.notes.length > 0 && (
            <div>
              <strong style={{ fontSize: "0.9em" }}>Recommendations:</strong>
              <ul style={{ marginTop: 8, paddingLeft: 20, fontSize: "0.9em" }}>
                {strengthData.notes.map((note: string, index: number) => (
                  <li key={index} style={{ marginBottom: 4, color: "dimgray" }}>
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* If backend sends no suggestions, display strong password message */}
          {strengthData.notes && strengthData.notes.length === 0 && (
            <Spacer marginTop="sm">
              <p style={{ color: "var(--color-success)", fontSize: "0.9em" }}>
                <FontAwesomeIcon icon={faCheck} /> This is a secure and strong password!
              </p>
            </Spacer>
          )}
        </div>
      )}
    </div>
  );
}
