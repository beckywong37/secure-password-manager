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

// Data returned by Password Strength Calculator
interface PasswordStrengthResult {
  score: number;
  strength: "Strong" | "Moderate" | "Weak";
  notes: string[];
}

export default function GeneratorPage() {
  // Set states for the Password Generator and configures default settings
  const [length, setLength] = useState(15);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [special, setSpecial] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  // Sets states for the Password Strength Calculator
  const [checkPassword, setCheckPassword] = useState("");
  const [strengthData, setStrengthData] = useState<PasswordStrengthResult | null>(null);
  const [strengthError, setStrengthError] = useState("");
  const [isCheckingStrength, setIsCheckingStrength] = useState(false);

  // Runs when user clicks the "Generate Password" button
  async function hitGeneratePassword() {
    // Clear previous error and password before generating new password
    setError("");
    setPassword("");

    try {
      // Makes POST request to Django backend endpoint to generate password
      const response = await fetch("http://127.0.0.1:8000/generator/api/generate-password/", {
        method: "POST",
        headers: { "Content-Type": "application/json" }, // Tells server data is in JSON format
        body: JSON.stringify({length, uppercase, lowercase, numbers, special}),
      });
      // Django responds but bad request, setError to display error message in the UI
      if (!response.ok) {
        return setError(`Server error: ${response.statusText}`);
      }
      // If POST request is successful, update React state with new password so it will display in UI
      const data = await response.json();
      const password = data.password;
      setPassword(password);
      // If password is not empty, check the strength
      if (password) await checkPasswordStrength(password);
    // Django server not responding, setError to display error message in the UI
    } catch {
      setError('Server not reachable. Check if Django is running and connected');
    }
  }
  // Runs when user clicks the "Check Strength" button or when password is generated
  async function checkPasswordStrength(passwordToCheck: string) {

    // Clears previous error and strength data before checking new password
    setStrengthError("");
    setIsCheckingStrength(true);
    setStrengthData(null);

    try {
      // Makes POST request to Django backend endpoint to check password strength
      const response = await fetch("http://127.0.0.1:8000/generator/api/check-strength/", {
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
      default:return "gray";
    }
  }

  // JSX to render Password Generator and Strength Calculator
  return (
    // Sets background color to dark blue 
    <div style={{ 
      backgroundColor: "darkblue", 
      minHeight: "100vh", 
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      padding: "80px 0 30px 0", // Add space at the top and bottom
      boxSizing: "border-box",
      fontFamily: '"Inter", "Helvetica Neue", Helvetica, Arial, sans-serif',
    }}>
      {/* Container for Password Generator and Strength Calculator */}
      <div style={{ maxWidth: 500, margin: "0 auto", backgroundColor: "white", padding: 20, borderRadius: 8 }}>
        <h2>Random Password Generator</h2>
        <p style={{ fontSize: "1.1em", color: "gray", marginBottom: 10 }}>A generator for secure passwords to protect your online accounts.</p>

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
        <div
        style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: 10,
        }}
        >
          {/*Uppercase Checkbox */}
        <label>
          <input
            type="checkbox"checked={uppercase} onChange={() => setUppercase(!uppercase)}
          /> Uppercase
        </label>

        {/* Lowercase Checkbox */}
        <label>
          <input
            type="checkbox" checked={lowercase} onChange={() => setLowercase(!lowercase)}
          /> Lowercase
        </label>

        {/* Numbers Checkbox */}
        <label>
          <input
            type="checkbox"checked={numbers} onChange={() => setNumbers(!numbers)}
          /> Numbers
        </label>

        {/* Special Characters Checkbox */}
        <label>
          <input
            type="checkbox" checked={special} onChange={() => setSpecial(!special)}
          /> Special Characters
        </label>
        </div>

        {/* Generate Password Button */}
        <button
          onClick={hitGeneratePassword}
          style={{
            marginTop: 10,
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: 6,
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "background-color 0.2s ease",
          }}
          // For hovering over button, change color to dark blue
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "darkblue";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#007bff";
          }}
        >Generate Password
        </button>

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
        <div style={{ marginTop: 20, paddingTop: 20, borderTop: "2px solid lightgray" }}>
          <h3>Password Strength Calculator</h3>
          <p style={{ fontSize: "1em", color: "gray", marginBottom: 15 }}>
            Check the strength of any password
          </p>
          {/* Input field for password to check */}
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <input
              type="text"
              value={checkPassword}
              onChange={(e) => setCheckPassword(e.target.value)}
              placeholder="Enter password to check strength"
              style={{
                flex: 1,
                padding: 8,
                border: "1.2px solid lightgray",
              }}
            />
            {/* Check Strength Button */}
            {/* If password is empty, disable button */}
            <button
              onClick={() => checkPasswordStrength(checkPassword)}
              disabled={isCheckingStrength || !checkPassword}
              style={{
                padding: "8px 16px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: 4,
                cursor: isCheckingStrength || !checkPassword ? "not-allowed" : "pointer",
                opacity: isCheckingStrength || !checkPassword ? 0.6 : 1,
              }}
            >
              {isCheckingStrength ? "Checking..." : "Check Strength"}
            </button>
          </div>

          {/* Display error message if password strength check fails */}
          {strengthError && (
            <p style={{ color: "red", fontSize: "0.9em", marginTop: 10 }}>{strengthError}</p>
          )}

          {/* Display strength data container*/}
          {strengthData && (
            <div
              style={{
                marginTop: 15,
                padding: 15,
                background: "white",
                borderRadius: 8,
                border: `2px solid ${getStrengthColor(strengthData.strength)}`,
              }}
            >
              {/* Display strength data */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <strong>Strength:</strong>
                <span
                  style={{
                    padding: "2px 12px",
                    borderRadius: 12,
                    backgroundColor: getStrengthColor(strengthData.strength),
                    color: "white",
                    fontSize: "0.9em",
                    fontWeight: "bold",
                  }}
                >
                  {strengthData.strength}
                </span>
                <span style={{ marginLeft: "auto", fontSize: "0.9em", color: "gray" }}>
                  Score: {strengthData.score}/10
                </span>
              </div>

              {/* Score Bar */}
              <div
                style={{
                  width: "100%",
                  height: 8,
                  backgroundColor: "lightgray",
                  borderRadius: 4,
                  marginBottom: 15,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${(strengthData.score / 10) * 100}%`,
                    height: "100%",
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
                <p style={{ color: "green", fontSize: "0.9em", marginTop: 8 }}>
                  ✓ This is a secure andstrong password!
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}