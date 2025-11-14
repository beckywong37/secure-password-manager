import { getCookie } from "../cookies/getCookie";

/**
* Helper to attempt to ensure a valid access token is available to access protected resources.
* If access token exists, returns true.
* If access missing (indicating it's expired) but refresh token exists, calls refresh endpoint
* If refresh token is also missing, returns false
* 
* @returns {Promise<boolean>} true if properly authenticated with valid access token, otherwise false
*/
export const hasAccessToken = async (): Promise<boolean> => {
    const accessToken = getCookie("accesstoken");
    const refreshToken = getCookie("refreshtoken");

    // Has valid access token
    if (accessToken) return true;

    // Has valid refresh token - attempt to retrieve new access token
    if (refreshToken) {
        try {
            const csrfToken = getCookie("csrftoken");
            if (!csrfToken) return false;

            const response = await fetch("/api/auth/token/", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrfToken,
                },
                body: JSON.stringify({refresh: refreshToken})
            });

            if (response.ok && getCookie("accesstoken")) {
                console.log("Access token refreshed successfully");
                return true;
            }
        } catch (err) {
            console.log("A network or server error occurred.");
            return false;
        }
    }
    console.log("No valid access or refresh token");
    return false;
};
