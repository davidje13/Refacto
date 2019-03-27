import React from 'react';

// Based vaguely on airbnb prop-types-exact, but with no added dependencies

function allowOnly(permitted) {
  const permittedSet = new Set(permitted);

  return (props, _, componentName) => {
    const badProps = Object.keys(props).filter((key) => !permittedSet.has(key));
    if (!badProps.length) {
      return null;
    }

    const propNames = badProps.map((key) => `\`${key}\``);

    return new TypeError((
      `Unknown props for ${componentName}: ${propNames.join(', ')}`
    ));
  };
}

function addUnknownPropsTest(propTypes, { alsoAllow = [] } = {}) {
  let propName = 'rejectUnknownProps';
  while (propTypes[propName] !== undefined) {
    propName = `rejectUnknownProps_${Math.random()}`;
  }
  return {
    [propName]: allowOnly([...Object.keys(propTypes), ...alsoAllow]),
    ...propTypes,
  };
}

function isComponent(o) {
  return (typeof o === 'function' || o instanceof React.Component);
}

export default function forbidExtraProps(o, options) {
  if (isComponent(o)) {
    // Called on component; mutate its static propTypes
    const component = o;

    component.propTypes = addUnknownPropsTest(component.propTypes || {}, options);
    return component;
  }

  // Called on propTypes entity; return a copy with the extra tests added
  return addUnknownPropsTest(o, options);
}
