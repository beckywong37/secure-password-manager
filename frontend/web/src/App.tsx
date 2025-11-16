/* 
GenAI Citation for April:
Portions of this code was generated/refactored with the help of Cursor with the Claude-4.5-sonnet model
The conversation in the file below documents the GenAI Interaction that led to my code.
../GenAI_transcripts/2025_11_15_Cursor_refactor_UI.md

This sets up the routes for the Secure Password Manager web app.

Features:
- Uses React Router to navigate between single page apps
- Navigation bar at the top with links to different pages:
  - Password Generator: http://localhost:5173/generator
  - Login Page: http://localhost:5173/login
    - Login form is the default view
    - Toggle between login/registration
  - Vault Page: http://localhost:5173/vault
*/

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import GeneratorPage from './pages/Generator';
import LoginPage from './pages/Login';
import { VaultPage } from './pages/Vault';
import { SessionProvider } from './contexts/SessionContext/SessionProvider';
import { NavBar } from './components/NavBar';
import { Spacer } from './components/Spacer';
import styles from './App.module.css';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <SessionProvider>
        <div className={styles.appContainer}>
          <Spacer padding="md">
            <NavBar />
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/generator" element={<GeneratorPage />} />
              <Route path="/vault" element={<VaultPage />} />
            </Routes>
          </Spacer>
        </div>
      </SessionProvider>
    </BrowserRouter>
  );
}

 