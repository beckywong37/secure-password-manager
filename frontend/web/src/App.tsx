/* 
GenAI Citation for April:
Portions of this code was generated/refactored with the help of Cursor with the Claude-4.5-sonnet model
The conversation in the file below documents the GenAI Interaction that led to my code.
../GenAI_transcripts/2025_11_15_Cursor_refactor_UI.md

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

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { ensureCSRFToken } from "./utils/cookies";

import { SessionManager } from "./components/SessionManager/SessionManager";
import LoginPage from "./pages/Login";
import MFAPage from "./pages/MFA";
import GeneratorPage from "./pages/Generator";
import MFASetupForm from "./components/MFASetup";
import MFAVerifyForm from "./components/MFAVerify";
import { VaultPage } from './pages/Vault';
import { NavBar } from './components/NavBar';
import { Spacer } from './components/Spacer';
import styles from './App.module.css';
import './index.css';

export default function App() {
  // Ensure CSRF cookie exists once app starts
  useEffect(() => {
    ensureCSRFToken();
  }, []);

  return (
    <BrowserRouter>
      <SessionManager>
        <div className={styles.appContainer}>
          <Spacer padding="md">
            <NavBar />

            <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route path="/login" element={<LoginPage />} />
              
              <Route path="/mfa" element={<MFAPage />}>
                <Route path="setup" element={<MFASetupForm />} />
                <Route path="verify" element={<MFAVerifyForm />} />
              </Route>
              
              <Route path="/generator" element={<GeneratorPage />} />
              <Route path="/vault" element={<VaultPage />} />
            </Routes>
          </Spacer>
        </div>
      </SessionManager>
    </BrowserRouter>
  );
}

 