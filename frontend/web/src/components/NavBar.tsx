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

