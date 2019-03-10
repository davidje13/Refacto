// Creates handler functions which will adjust parameters according to the
// current state of props. The handlers only need to be created once (e.g. in a
// constructor); they will read the current callback function and props when
// invoked.

// e.g.:
// const { onSomething } = this.props;
// const handler = dynamicBind(this, { onSomething }, (currentProps) => [currentProps.foo]);
//
// later:
// handler('bar'); // same as this.props.onSomething(this.props.foo, 'bar');

export function prefix(func) {
  return (args, props) => [...func(props, args), ...args];
}

function wrap(thisArg, propName, argMutator) {
  const wrapper = (...args) => {
    const fn = thisArg.props[propName];
    if (fn) {
      const mutatedArgs = argMutator(args, thisArg.props);
      fn(...mutatedArgs);
    }
  };
  wrapper.exists = () => Boolean(thisArg.props[propName]);
  wrapper.optional = () => (thisArg.props[propName] ? wrapper : null);
  return wrapper;
}

export function dynamicMutate(thisArg, prop, argMutator) {
  const names = Object.keys(prop);
  if (names.length !== 1) {
    throw new Error('dynamicMutate must be given exactly one property');
  }
  const propName = names[0];

  return wrap(thisArg, propName, argMutator);
}

export function dynamicBind(thisArg, prop, prefixFunc) {
  return dynamicMutate(thisArg, prop, prefix(prefixFunc));
}
