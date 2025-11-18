/*
This page handles MFA Setup and MFA Verification.

The route determines which MFA component is displayed:
- /mfa-setup > MFASetup
- /mfa-verify > MFAVerify

SessionManager will automatically route the user here 
based on MFA tokens.
*/

import styles from "./Page.module.css";
import { Outlet } from "react-router-dom";
import loginLogo from "../assets/LoginLogo.jpeg";

export default function MFAPage() {
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
            display: "block",
          }}
        />

        {/* This will render either MFASetup or MFAVerify */}
        <Outlet />
      </div>
    </div>
  );
}
