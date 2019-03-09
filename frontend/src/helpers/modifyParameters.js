// Creates handler functions which will adjust parameters according to the
// current state of props. The handlers only need to be created once (e.g. in a
// constructor); they will read the current callback function and props when
// invoked.

// e.g.:
// const handlers = modifyParameters(
//   this,
//   (args, props) => [props.foo, ...args]
// );
//
// handlers.onClick('bar'); // same as this.props.onClick(this.props.foo, 'bar');

function getFuncPropNames(props) {
  if (Array.isArray(props)) {
    return props;
  }

  return Object.keys(props)
    .filter((prop) => (typeof props[prop] === 'function'));
}

export function prefixValues(...values) {
  return (args) => [...values, ...args];
}

export function prefixProps(...propNames) {
  return (args, props) => [...propNames.map((prop) => props[prop]), ...args];
}

export default function modifyParameters(thisArg, argMutator, props = null) {
  const fnPropNames = getFuncPropNames(props || thisArg.props);

  const handlers = {};
  fnPropNames.forEach((prop) => {
    handlers[prop] = (...args) => {
      const fn = thisArg.props[prop];
      const mutatedArgs = argMutator(args, thisArg.props);
      fn(...mutatedArgs);
    };
  });
  return handlers;
}
