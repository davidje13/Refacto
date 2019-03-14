import http from 'http';

function wrapWebsocket(fn) {
  if (typeof fn !== 'function') {
    return fn;
  }
  return (req, res, next) => {
    if (res.websocket) {
      fn(req, res.websocket, next);
    } else {
      next('route');
    }
  };
}

function wrapNonWebsocket(fn) {
  if (typeof fn !== 'function') {
    return fn;
  }
  return (req, res, next) => {
    if (!res.websocket) {
      fn(req, res, next);
    } else {
      next('route');
    }
  };
}

function wrapHandler(o, method, wrapper) {
  const target = o;
  const original = target[method].bind(target);
  target[method] = (...handlers) => original(...handlers.map(wrapper));
}

export default function wrapHandlers(o) {
  const target = o;

  target.ws = target.use;
  wrapHandler(target, 'ws', wrapWebsocket);

  target.useHTTP = target.use;
  wrapHandler(target, 'useHTTP', wrapNonWebsocket);

  http.METHODS.forEach((method) => {
    wrapHandler(target, method.toLowerCase(), wrapNonWebsocket);
  });

  wrapHandler(target, 'all', wrapNonWebsocket);
}
