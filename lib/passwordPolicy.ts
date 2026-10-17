/** Local form safeguard only. Not a breached-password database, nor an Auth-server policy.
 * Never log, store, hash for telemetry, or send the password to another service here.
 * Existing passwords must still be accepted at sign-in; validate only NEW passwords.
 */
export const NEW_PASSWORD_HELP = "Use at least 12 characters. A unique passphrase or password-manager password is best.";
export function newPasswordError(password: string): string | null {
  if (Array.from(password).length < 12) return "Use at least 12 characters for your new password.";
  const simplified = password.toLowerCase().replace(/[\s!@#$%^&*()_+\-=.,?]/g, "");
  if (/^(password|qwerty|letmein|welcome|admin|palevie|iloveyou|abc123|1234567890)\d*$/.test(simplified)
      || /^(.{1,4})\1{2,}$/.test(simplified)
      || /^\d+$/.test(simplified)) {
    return "That password is too easy to guess. Choose a unique passphrase instead.";
  }
  return null;
}
