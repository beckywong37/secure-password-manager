/*
This creates the Login/Registration page using React.

Features:
- Login page is the default view
- Users can switch between login and registration views

Note:
To start the Vite dev server, run: 'npm run dev' in the frontend/web directory.

GenAI Citation for Becky:
Portions of this code related to toggling between login and registration view and 
image import were generated with the help of ChatGPT-5. 
The conversation transcript [ChatGPT-5 linked here](https://chatgpt.com/c/6909a5b2-4044-8328-a301-dec7aa7cb71b)
documents the GenAI Interaction that led to my code.
*/

// Imports React, styles, and components
import { useState } from 'react';
import styles from './Page.module.css';
import LoginForm from '../components/LoginForm';
import RegistrationForm from '../components/RegistrationForm';
import loginLogo from '../assets/LoginLogo.jpeg';

export default function LoginPage() {
    // mode is a string that can be either 'login' or 'register', 'login' is default
    // setMode is a function used to update the mode
    const [mode, setMode] = useState<'login' | 'register'>('login');
  
    // forms[login] renders LoginForm, forms[register] renders RegistrationForm
    const forms = {
      login: <LoginForm onSwitchToRegister={() => setMode('register')} />,
      register: <RegistrationForm onSwitchToLogin={() => setMode('login')} />,
    };
  
    return (
        // Use styles for page container and content container (Page.module.css)
      <div className={styles.pageContainer}>
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
            
            {/* Renders either LoginForm or RegistrationForm based on the mode */}
          {forms[mode]}
        </div>
      </div>
    );
  }

