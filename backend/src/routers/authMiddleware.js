function splitFirst(data, delimiter) {
  const sep = data.indexOf(delimiter);
  if (sep === -1) {
    return [data];
  }
  return [data.substr(0, sep), data.substr(sep + delimiter.length)];
}

function extractToken(auth) {
  const [type, data] = splitFirst(auth, ' ');

  if (type === 'Bearer') {
    return data;
  }

  return null;
}

async function getUserAuthentication(userAuthService, req) {
  const auth = req.get('Authorization');
  if (!auth) {
    return null;
  }

  const userToken = extractToken(auth);
  if (!userToken) {
    return null;
  }

  return userAuthService.readAndVerifyToken(userToken);
}

async function getRetroAuthentication(retroAuthService, req, retroId) {
  const auth = req.get('Authorization');
  if (!auth) {
    return null;
  }

  const retroToken = extractToken(auth);
  if (!retroToken) {
    return null;
  }

  return retroAuthService.readAndVerifyToken(retroId, retroToken);
}

export function userAuth(userAuthService, { optional = false } = {}) {
  return async (req, res, next) => {
    res.locals.authRealm = 'user';
    const auth = await getUserAuthentication(userAuthService, req);
    if (!auth && !optional) {
      res
        .status(401)
        .header('WWW-Authenticate', `Bearer realm="${res.locals.authRealm}"`)
        .end();
      return;
    }
    res.locals.auth = auth;
    next();
  };
}

export function retroAuth(retroAuthService, { optional = false } = {}) {
  return async (req, res, next) => {
    const { retroId } = req.params;
    res.locals.authRealm = retroId;
    const auth = await getRetroAuthentication(retroAuthService, req, retroId);
    if (!auth && !optional) {
      res
        .status(401)
        .header('WWW-Authenticate', `Bearer realm="${res.locals.authRealm}"`)
        .end();
      return;
    }
    res.locals.auth = auth;
    next();
  };
}

export function authScope(scope) {
  return async (req, res, next) => {
    if (!res.locals.auth[scope]) {
      res
        .status(403)
        .header(
          'WWW-Authenticate',
          `Bearer realm="${res.locals.authRealm}", scope="${scope}"`,
        )
        .end();
      return;
    }
    next();
  };
}
