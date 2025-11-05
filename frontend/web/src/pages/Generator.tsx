/*
This creates the Password Generator/Strength Calculator page using React.

** GenAI Citation for Becky: **
Portions of this code related to the Password Generator/Strength Calculator page were generated with 
the help of ChatGPT-5. Specifically to outline the overall architecture of the web page,
assisting in structuring the React-based front-end and Django REST API integration,
and implementing UI elements such as the interactive length slider and checkboxes for password criteria.
The conversation transcript [ChatGPT-5 linked here](https://chatgpt.com/c/69045b2c-e3f4-832b-bd71-d59fcef093c6)
documents the GenAI Interaction that led to my code.
*/

// Imports
import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Page.module.css';
import PasswordGenerator from '../components/PasswordGenerator';
import PasswordStrengthCalculator from '../components/PasswordStrengthCalculator';

export default function GeneratorPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Handle password generation from PasswordGenerator component
  function handlePasswordGenerated(generatedPassword: string) {
    setPassword(generatedPassword);
    setError("");
  }

  // JSX to render Password Generator and Strength Calculator
  return (
    <div className={styles.pageContainer}>
      {/* Container for Password Generator and Strength Calculator */}
      <div className={styles.contentContainer}>
        <PasswordGenerator 
          onPasswordGenerated={handlePasswordGenerated}
          onError={setError}
        />

        {/* Display error message if password generation fails */}
        {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}

        {/* Display generated password */}
        {password && (
          <div style={{ marginTop: 15, padding: 10, background: "white", borderRadius: 8, border: "1.5px solid lightgray" }}>
            <strong>Generated Password:</strong>
            <p style={{ fontFamily: "monospace", wordBreak: "break-all" }}>{password}</p>
          </div>
        )}

        {/* Password Strength Calculator Section */}
        <PasswordStrengthCalculator passwordToAutoCheck={password} />

        {/* Link go back to Vault Page */}
        <div style={{ marginTop: 35, textAlign: "center" }}>
          <Link 
            to="/vault" 
            style={{color: "#007bff"}}
          >
            View Your Vault →
          </Link>
        </div>
      </div>
    </div>
  );
}
