// Try various ways of storing data for later retrieval;
// - FireFox's sessionStorage does not survive navigating between sites
// - Mobile Safari's storage throws when trying to write in private mode

export default {
  setItem(key: string, value: string): void {
    try {
      // prefer localStorage because both will work in FF,
      // but sessionStorage will be cleared during navigation
      // (would be better to prefer sessionStorage for isolation)
      // https://bugzilla.mozilla.org/show_bug.cgi?id=1656768
      window.localStorage.setItem(key, value);
    } catch (e) {
      // fall-back to sessionStorage in case the user has blocked
      // localStorage (other browsers let sessionStorage survive navigation)
      window.sessionStorage.setItem(key, value);
    }
  },

  getItem(key: string): string | null {
    let v = null;
    try {
      v = window.localStorage.getItem(key);
    } catch (e) {
      // ignore
    }
    try {
      return v ?? window.sessionStorage.getItem(key);
    } catch (e) {
      return null;
    }
  },

  removeItem(key: string): void {
    try {
      window.localStorage.removeItem(key);
    } catch (e) {
      // ignore
    }
    try {
      window.sessionStorage.removeItem(key);
    } catch (e) {
      // ignore
    }
  },
};
