/*
GenAI Citation for April:
Portions of this code was generated with the help of Cursor with the Claude-4.5-sonnet model
The conversation in the file below documents the GenAI Interaction that led to my code.
../GenAI_transcripts/2025_11_25_Cursor_UserGuide.md
*/

import { useState, useEffect, useRef } from 'react';
import styles from './UserGuide.module.css';
import vaultScreenshot from '../assets/vault.png';
import passwordGeneratorScreenshot from '../assets/password_generator.png';

export default function UserGuidePage() {
  const [activeSection, setActiveSection] = useState<string>('registration');
  const [modalImage, setModalImage] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Create intersection observer to track which section is visible
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-100px 0px -60% 0px',
        threshold: 0
      }
    );

    // Observe all section headings
    const sections = document.querySelectorAll('section[id]');
    sections.forEach((section) => {
      observerRef.current?.observe(section);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const navBarHeight = 100; // Approximate height of navbar
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - navBarHeight,
        behavior: 'smooth'
      });
    }
  };

  const openImageModal = (imageSrc: string) => {
    setModalImage(imageSrc);
  };

  const closeImageModal = () => {
    setModalImage(null);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <div className={styles.mainContent}>
          <h1>User Guide</h1>
          <p className={styles.intro}>
            Welcome to the Secure Password Manager! This guide will help you get started 
            with managing your passwords securely.
          </p>
          <p><em>Notes:</em> </p>
        <ul>
            <li>We recommend using a desktop browser for the best experience.</li>
            <li>The first time you open the web application, it may take a few seconds to load.</li>
        </ul>
          

          <section id="registration">
            <h2>Registration</h2>
            <p>
              To create a new account, navigate to the login page and click "Register New Account" under the login button.
              You'll need to provide a username, email, and a strong password. 
            </p>
            <p>
              During registration, you'll set up multi-factor authentication (MFA) to add an extra 
              layer of security to your account.
            </p>
            <p>
                <em>Note:</em> Your TOTP code might expire while you are trying to register or login. If this happens, try again with a fresh code.
            </p>
        
          </section>

          <section id="login">
            <h2>Log In</h2>
            <p>
              Once you've registered, you can log in using your username and password. 
              After entering your credentials, you'll be prompted to complete MFA verification 
              using your authenticator app.
            </p>
          </section>

          <section id="vault">
            <h2>Vault</h2>
            <p>
              The Vault is where you store all your passwords and credentials. Each entry can include:
            </p>
            <ul>
              <li><strong>Title:</strong> The name of the website or application (required)</li>
              <li><strong>Username:</strong> Your username or email for that service (required)</li>
              <li><strong>Password:</strong> Your password (required)</li>
              <li><strong>Email:</strong> Associated email address (optional)</li>
              <li><strong>URL:</strong> The website URL (optional)</li>
              <li><strong>Notes:</strong> Additional information (optional)</li>
            </ul>
            <p>You can view each record by clicking on the record's card in the Vault.</p>
            <p>You can click on the copy icon next to each field to copy the value to your clipboard.</p>
            
            <h3>Adding a New Record</h3>
            <p>
              Click the "Add Record" button to create a new password entry. Fill in the required 
              fields and click "Save" to securely store your credentials.
            </p>

            <h3>Editing and Deleting Records</h3>
            <p>
              Click on any record to view its details. From there, you can edit the information 
              or delete the record entirely. 
            </p>

            {/* Example image embed */}
            <div className={styles.imageContainer}>
              <img 
                src={vaultScreenshot} 
                alt="Vault page showing password records" 
                className={styles.guideImage}
                onClick={() => openImageModal(vaultScreenshot)}
              />
              <p className={styles.imageCaption}>
                Figure 1: Vault page with password records
              </p>
            </div>
          </section>

          <section id="password-generator">
            <h2>Password Generator</h2>
            <p>
              The Password Generator helps you create strong, random passwords for your accounts. 
              You can customize the password by selecting:
            </p>
            <ul>
              <li><strong>Length:</strong> Choose between 8-128 characters</li>
              <li><strong>Character types:</strong> Include uppercase, lowercase, numbers, and symbols</li>
            </ul>

            <h3>Password Strength Calculator</h3>
            <p>
              The built-in strength calculator evaluates your password and provides feedback on 
              its security. It checks for common passwords, length, and character variety to help 
              you create the most secure passwords possible.
            </p>

            <h3>Using Generated Passwords</h3>
            <p>
              Once you generate a password, you can copy it to your clipboard by clicking the copy icon and use it when 
              creating accounts or updating passwords. Consider saving it to your Vault immediately 
              for safekeeping.
            </p>

            {/* Example image embed */}
            <div className={styles.imageContainer}>
              <img 
                src={passwordGeneratorScreenshot} 
                alt="Password Generator page" 
                className={styles.guideImage}
                onClick={() => openImageModal(passwordGeneratorScreenshot)}
              />
              <p className={styles.imageCaption}>
                Figure 2: Password Generator with customization options and Strength Calculator
              </p>
            </div>
          </section>
        </div>

        <aside className={styles.tableOfContents}>
          <nav>
            <h3 className={styles.tocTitle}>Table of Contents</h3>
            <ul className={styles.tocList}>
              <li>
                <button
                  className={`${styles.tocLink} ${activeSection === 'registration' ? styles.tocLinkActive : ''}`}
                  onClick={() => scrollToSection('registration')}
                >
                  Registration
                </button>
              </li>
              <li>
                <button
                  className={`${styles.tocLink} ${activeSection === 'login' ? styles.tocLinkActive : ''}`}
                  onClick={() => scrollToSection('login')}
                >
                  Log In
                </button>
              </li>
              <li>
                <button
                  className={`${styles.tocLink} ${activeSection === 'vault' ? styles.tocLinkActive : ''}`}
                  onClick={() => scrollToSection('vault')}
                >
                  Vault
                </button>
              </li>
              <li>
                <button
                  className={`${styles.tocLink} ${activeSection === 'password-generator' ? styles.tocLinkActive : ''}`}
                  onClick={() => scrollToSection('password-generator')}
                >
                  Password Generator
                </button>
              </li>
            </ul>
          </nav>
        </aside>
      </div>

      {/* Image Modal */}
      {modalImage && (
        <div className={styles.imageModal} onClick={closeImageModal}>
          <span className={styles.imageModalClose}>&times;</span>
          <img 
            src={modalImage} 
            alt="Full size view" 
            className={styles.imageModalContent}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

