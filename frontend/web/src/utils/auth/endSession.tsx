/*
This is the Logout component for the Secure Password Manager web app.
It's called into NavBar.tsx to handle blacklisting the refresh token and removing auth tokens from the browser.
It calls the backend logout endpoint.
*/

import { apiRequest } from "../http/apiRequest"; 

export const endSession = async (clearVaultKey?: () => void) => {    
    try {
        await apiRequest("/api/auth/logout/", {
            method: "POST",
            suppressErrors: true,
        });
        
        // Clear vault key from memory on logout
        if (clearVaultKey) {
            clearVaultKey();
        }
    } catch {
        // noop
    }
};
