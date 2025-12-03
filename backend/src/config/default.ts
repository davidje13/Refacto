export default {
  port: 5000,
  forwardHost: '',
  mockSsoPort: 0,
  serverBindAddress: '',
  trustProxy: false,
  log: {
    file: '/dev/stderr',
  },
  analytics: {
    eventDetail: 'none',
    clientErrorDetail: 'message',
  },
  password: {
    workFactor: 10,
    secretPepper: '',
  },
  passwordCheck: {
    baseUrl: 'https://api.pwnedpasswords.com',
  },
  token: {
    secretPassphrase: '',
  },
  encryption: {
    secretKey: '',
  },
  db: {
    url: 'memory://refacto',
  },
  insecure: {
    sharedAccount: {
      enabled: false,
      authUrl: '/api/open-login',
    },
  },
  permit: {
    myRetros: true,
  },
  sso: {
    google: {
      clientId: '',
      authUrl: 'https://accounts.google.com/o/oauth2/auth',
      certsUrl: 'https://www.googleapis.com/oauth2/v3/certs',
    },
    github: {
      clientId: '',
      clientSecret: '',
      authUrl: 'https://github.com/login/oauth/authorize',
      accessTokenUrl: 'https://github.com/login/oauth/access_token',
      userUrl: 'https://api.github.com/user',
    },
    gitlab: {
      clientId: '',
      authUrl: 'https://gitlab.com/oauth/authorize',
      accessTokenUrl: 'https://gitlab.com/oauth/token',
      tokenInfoUrl: 'https://gitlab.com/oauth/token/info',
    },
  },
  giphy: {
    baseUrl: 'https://api.giphy.com/v1',
    apiKey: '',
  },
};
