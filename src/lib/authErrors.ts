/**
 * Maps Firebase Auth error codes to user-friendly, actionable feedback messages.
 */
export function getFirebaseAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'The email address is formatted incorrectly. Please check and try again.';
    case 'auth/user-disabled':
      return 'This Peak Day account has been disabled. Please contact support.';
    case 'auth/user-not-found':
      return 'No Peak Day account found with this email address. Try signing up instead.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please verify your credentials or reset your password.';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email address. Try signing in or resetting your password.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters with a combination of letters and numbers.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is currently disabled in your Firebase console.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in popup was closed before completing authentication.';
    case 'auth/popup-blocked':
      return 'The authentication popup was blocked by your browser. Please allow popups for Peak Day.';
    case 'auth/cancelled-popup-request':
      return 'Another sign-in attempt was already in progress.';
    case 'auth/network-request-failed':
      return 'Network connection issue. Please check your internet connection and try again.';
    case 'auth/too-many-requests':
      return 'Too many unsuccessful attempts. Access has been temporarily locked for security. Please reset your password or try again later.';
    default:
      return 'An unexpected authentication error occurred. Please try again.';
  }
}
