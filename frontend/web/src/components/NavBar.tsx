// GenAI Citation for April:
// Portions of this code was generated/refactored with the help of Cursor with the Claude-4.5-sonnet model
// The conversation in the file below documents the GenAI Interaction that led to my code.
// ../GenAI_transcripts/2025_11_15_Cursor_refactor_UI.md 

import { Link, useNavigate } from 'react-router-dom';
import { useSession } from "./SessionManager/useSession";
import { SessionStatus } from "./SessionManager/SessionStatus";
import { useVaultKey } from '../contexts/useVaultKey';
import { Button } from './Button';
import { endSession } from '../utils/auth/endSession';
import styles from './NavBar.module.css';

export const NavBar = () => {
    const navigate = useNavigate();
    const { status } = useSession();
    const { clearVaultKey } = useVaultKey();
    const isAuthenticated = status === SessionStatus.AUTHENTICATED;

    const handleLogout = async () => {
        await endSession(clearVaultKey);
        navigate("/login", { replace: true });
    };

    return (
        <nav className={styles.navbar}>
            <div className={styles.navLinks}>
                {/* Links to MFA pages are commented out because when logged in, these route back to vault. */}
                {/* <Link to="/mfa/verify" className={styles.navLink}>MFA Verify Page</Link>
                <Link to="/mfa/setup" className={styles.navLink}>MFA Setup Page</Link> */}
                <Link to="/generator" className={styles.navLink}>Password Generator</Link>
                <Link to="/vault" className={styles.navLink}>Vault</Link>
                <Link to="/guide" className={styles.navLink}>User Guide</Link>
            </div>
            {isAuthenticated ? (
                <Button variant="secondary" onClick={handleLogout}>
                    Logout
                </Button>
            ) : (
                <Link to="/login" className={styles.navLink}>Login</Link>
            )}
        </nav>
    );
};

