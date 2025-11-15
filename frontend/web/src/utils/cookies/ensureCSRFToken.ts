import { getCookie } from "./getCookie";

/**
* Helper to ensure CSRF cookie exists
* 
* @returns {Promise<void>} Resolves once the CSRF cookie is confirmed or retrieved.
*/
export const ensureCSRFToken = async (): Promise<void> => {
  if (!getCookie("csrftoken")) {
    await fetch("/api/auth/csrf/", {
      credentials: "include",
    });
  }
};