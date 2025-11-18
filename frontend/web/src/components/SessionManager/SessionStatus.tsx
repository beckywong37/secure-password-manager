// Possible authentication states

export const SessionStatus = {
  LOADING: "LOADING",
  AUTHENTICATED: "AUTHENTICATED",
  MFA_VERIFY_REQUIRED: "MFA_VERIFY_REQUIRED",
  MFA_SETUP_REQUIRED: "MFA_SETUP_REQUIRED",
  UNAUTHENTICATED: "UNAUTHENTICATED",
} as const;
export type SessionStatus = (typeof SessionStatus)[keyof typeof SessionStatus];
