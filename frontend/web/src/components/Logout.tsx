/*
This is the Logout component for the Secure Password Manager web app.
It's called into NavBar.tsx to handle blacklisting the refresh token and removing auth tokens from the browser.
It calls the backend logout endpoint.
*/

import { apiRequest } from "../utils/http/apiRequest"; 

export const Logout = async () => {    
    try {
        await apiRequest("/api/auth/logout/", {
            method: "POST",
            suppressErrors: true,
        });
    } catch {
    }
};
