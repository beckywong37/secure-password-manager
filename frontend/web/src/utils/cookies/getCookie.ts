/**
* Helper to read Django's csrftoken cookie
* 
* @param {string} cookieName
* @returns {string | null} string if cookie with matching name exists, otherwise null.
*/
export const getCookie = (cookieName: string): string | null => {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${cookieName}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};