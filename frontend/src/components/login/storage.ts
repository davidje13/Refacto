function getStorage(storage: Storage, key: string): string | null {
  try {
    return storage.getItem(key);
  } catch (e) {
    return null;
  }
}

function setStorage(storage: Storage, key: string, value: string): boolean {
  try {
    storage.setItem(key, value);
    return storage.getItem(key) === value;
  } catch (e) {
    return false;
  }
}

function deleteStorage(storage: Storage, key: string) {
  try {
    storage.removeItem(key);
  } catch (e) {
    // ignore
  }
}

function getCookie(key: string): string | null {
  const encodedKey = encodeURIComponent(key);
  try {
    const cookies = document.cookie
      .split(/; */g)
      .filter((c) => c.startsWith(`${encodedKey}=`));
    if (!cookies.length) {
      return null;
    }
    const prefixLength = encodedKey.length + 1;
    const nonempty = cookies.find((c) => c.length > prefixLength);
    return decodeURIComponent(
      (nonempty ?? cookies[0] ?? '').substring(prefixLength),
    );
  } catch (e) {
    return null;
  }
}

function setSessionCookie(key: string, value: string, extra = ''): boolean {
  const encodedKey = encodeURIComponent(key);
  try {
    document.cookie = `${encodedKey}=${encodeURIComponent(
      value,
    )}${extra}; path=/; secure; samesite=strict`;
    return getCookie(key) === value;
  } catch (e) {
    return false;
  }
}

function deleteCookie(key: string) {
  setSessionCookie(
    key,
    '',
    '; max-age=0; expires=Thu, 01 Jan 1970 00:00:01 GMT',
  );
}

export const storage = {
  setItem(key: string, value: string): boolean {
    let any = false;
    // sessionStorage is best option for security and privacy
    if (setStorage(window.sessionStorage, key, value)) {
      any = true;
    }
    // if sessionStorage fails for any reason, throw everything at the wall and see what sticks:
    any = setStorage(window.localStorage, key, value) || any; // do not short-circuit
    any = setSessionCookie(key, value) || any;
    return any;
  },

  getItem(key: string): string | null {
    return (
      getStorage(window.sessionStorage, key) ||
      getStorage(window.localStorage, key) ||
      getCookie(key)
    );
  },

  removeItem(key: string) {
    deleteStorage(window.sessionStorage, key);
    deleteStorage(window.localStorage, key);
    deleteCookie(key);
  },
};
