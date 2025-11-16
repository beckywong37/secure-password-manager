/* 
This sets up the routes for the Secure Password Manager web app.

Features:
- Uses React Router to navigate between single page apps
- Navigation bar at the top with links to different pages:
  - Password Generator: /generator
  - Login Page: /login
    - Login form is the default view
    - Toggle between registration
  - MFA Page: /mfa
    - Handles /setup and /verification
  - Vault Page: /vault
*/

import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useEffect } from "react";
import { ensureCSRFToken } from "./utils/cookies";

import { SessionManager } from "./components/SessionManager";
import LoginPage from "./pages/Login";
import MFAPage from "./pages/MFA";
import GeneratorPage from "./pages/Generator";
import MFASetupForm from "./components/MFASetup";
import MFAVerifyForm from "./components/MFAVerify";

export default function App() {
  // Ensure CSRF cookie exists once app starts
  useEffect(() => {
    ensureCSRFToken();
  }, []);

  return (
    <BrowserRouter>
      <SessionManager>
        <div style={{ maxWidth: 900, margin: '20px auto', padding: 16, fontFamily: "sans-serif" }}>
          <nav style={{ display: 'flex', gap: 20, marginBottom: 30, backgroundColor: 'lightgray', padding: 15, borderRadius: 8 }}>
            <Link to="/login">Login Page</Link>
            <Link to="/mfa/verify">MFA Verify Page</Link>
            <Link to="/mfa/setup">MFA Setup Page</Link>
            <Link to="/generator">Password Generator</Link>
            <Link to="/vault">Vault Page</Link>
          </nav>

          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            
            <Route path="/mfa" element={<MFAPage />}>
              <Route path="setup" element={<MFASetupForm />} />
              <Route path="verify" element={<MFAVerifyForm />} />
            </Route>
            
            <Route path="/generator" element={<GeneratorPage />} />
            <Route path="/vault" element={<div>Vault Page Under Construction - Coming Soon!</div>} />
          </Routes>
        </div>
      </SessionManager>
    </BrowserRouter>
  );
}

 