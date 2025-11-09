/* 
This sets up the routes for the Secure Password Manager web app.

Features:
- Uses React Router to navigate between single page apps
- Navigation bar at the top with links to different pages:
  - Password Generator: http://localhost:5173/generator
  - Login Page: http://localhost:5173/login
  - Vault Page: http://localhost:5173/vault
*/

import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import GeneratorPage from './pages/Generator';

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ maxWidth: 900, margin: '20px auto', padding: 16, fontFamily: "sans-serif" }}>
        <nav style={{ display: 'flex', gap: 20, marginBottom: 30, backgroundColor: 'lightgray', padding: 15, borderRadius: 8 }}>
          <Link to="/login">Login Page</Link>
          <Link to="/generator">Password Generator</Link>
          <Link to="/vault">Vault Page</Link>
        </nav>
        <Routes>
          <Route path="/login" element={<div>Login Page Under Construction</div>} />
          <Route path="/generator" element={<GeneratorPage />} />
          <Route path="/vault" element={<div>Vault Page Under Construction</div>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

 