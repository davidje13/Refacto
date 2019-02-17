const headHtmlSnippet = `
<meta http-equiv="content-security-policy" content="
  base-uri 'self';
  default-src 'self';
  object-src 'none';
  script-src 'self' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  connect-src 'self';
  font-src 'self';
  img-src 'self';
  form-action 'none';
">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="format-detection" content="telephone=no">
<meta name="theme-color" content="#000000">
`;

const bodyHtmlSnippet = `
<noscript>Please enable Javascript!</noscript>
`;

const htmlConfig = {
  title: 'Refacto',
  links: [
    {href: '/static/favicon.png', rel: 'shortcut icon'},
    {href: '/static/apple-touch-icon.png', rel: 'apple-touch-icon'},
    {href: '/static/manifest.json', rel: 'manifest'},
  ],
  headHtmlSnippet,
  bodyHtmlSnippet,
};

module.exports = {
  options: {
    tests: 'src',
    port: process.env.PORT || 5000,
  },
  use: [
    '@neutrinojs/airbnb',
    '@neutrinojs/jest',
    ['@neutrinojs/react', {
      hot: false,
      html: htmlConfig,
      publicPath: '/',
    }],
  ],
};
