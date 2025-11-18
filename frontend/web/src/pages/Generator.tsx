/*
This creates the Password Generator/Strength Calculator page using React.

Note:
To start the Vite dev server, run: 'npm run dev' in the frontend/web directory.

** GenAI Citation for Becky: **
Portions of this code related to the Password Generator/Strength Calculator page were generated with 
the help of ChatGPT-5. Specifically to outline the overall architecture of the web page,
assisting in structuring the React-based front-end and Django REST API integration,
and implementing UI elements such as the interactive length slider and checkboxes for password criteria.
The conversation transcript [ChatGPT-5 linked here](https://chatgpt.com/c/69045b2c-e3f4-832b-bd71-d59fcef093c6)
documents the GenAI Interaction that led to my code.

** Gen AI Citation for April: **
Portions of this code related to copying the password to the clipboard were generated with
the help of Cursor with the Claude-4.5-sonnet model.
The conversation transcript below documents the GenAI Interaction that led to my code.
../GenAI_transcripts/2026_11_16_Cursor_refactor_components.md
*/

// Imports
import { useState, type FC } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faCheck } from '@fortawesome/free-solid-svg-icons';
import styles from './Page.module.css';
import PasswordGenerator from '../components/PasswordGenerator';
import PasswordStrengthCalculator from '../components/PasswordStrengthCalculator';
import { Input } from '../components/Input';
import { Spacer } from '../components/Spacer';
import loginLogo from '../assets/LoginLogo.jpeg';

interface CopyButtonProps {
  text: string;
  isCopied: boolean;
  onCopy: (text: string) => void;
}

const CopyButton: FC<CopyButtonProps> = ({ text, isCopied, onCopy }) => (
  <button
    type="button"
    className={styles.copyButton}
    onClick={() => onCopy(text)}
    aria-label="Copy password"
  >
    <FontAwesomeIcon icon={isCopied ? faCheck : faCopy} />
  </button>
);

export default function GeneratorPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  // Handle password generation from PasswordGenerator component
  function handlePasswordGenerated(generatedPassword: string) {
    setPassword(generatedPassword);
    setError("");
    setIsCopied(false);
  }

  // Handle copying password to clipboard
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // JSX to render Password Generator and Strength Calculator
  return (
    <div className={styles.pageContainer}>
      {/* Container for Password Generator and Strength Calculator */}
      <div className={styles.contentContainer}>
            {/* Logo for Login and Registration pages */}
             <img 
              src={loginLogo} 
              alt="Secure Password Manager Logo" 
              style={{ 
                width: "120px", 
                height: "auto",
                margin: "0 auto 1px", 
                display: "block" 
              }} 
            /> 
        <div className={styles.formCard}>
          <h2>Random Password Generator</h2>
          <p style={{ fontSize: "1.1em", color: "gray", marginBottom: 30, marginTop: 8 }}>
            A generator for secure passwords to protect your online accounts.
          </p>
        </div>
        
        <PasswordGenerator 
          onPasswordGenerated={handlePasswordGenerated}
          onError={setError}
        />

        {/* Display error message if password generation fails */}
        {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}

        {/* Display generated password */}
        {password && (
          <Spacer marginTop="md">
            <Input
              label="Generated Password"
              type="text"
              value={password}
              readOnly
              style={{ fontFamily: "monospace" }}
              rightAdornment={
                <CopyButton
                  text={password}
                  isCopied={isCopied}
                  onCopy={handleCopy}
                />
              }
            />
          </Spacer>
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
