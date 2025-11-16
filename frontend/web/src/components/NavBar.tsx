// GenAI Citation for April:
// Portions of this code was generated/refactored with the help of Cursor with the Claude-4.5-sonnet model
// The conversation in the file below documents the GenAI Interaction that led to my code.
// ../GenAI_transcripts/2025_11_15_Cursor_refactor_UI.md 

import { Link } from 'react-router-dom';
import { SessionStatus } from '../contexts/SessionContext/SessionStatus';
import { useSession } from '../contexts/SessionContext/useSession';
import { Button } from './Button';
import styles from './NavBar.module.css';

export const NavBar = () => {
    const { status } = useSession();
    const isAuthenticated = status === SessionStatus.AUTHENTICATED;

    // TODO: Implement actual logout functionality
    const handleLogout = () => {
        console.log('Logout clicked - TODO: Implement logout');
    };

    return (
        <nav className={styles.navbar}>
            <div className={styles.navLinks}>
                <Link to="/generator" className={styles.navLink}>Password Generator</Link>
                <Link to="/vault" className={styles.navLink}>Vault</Link>
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

