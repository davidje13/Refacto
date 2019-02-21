import React from 'react';

// Based vaguely on airbnb prop-types-exact, but with no added dependencies

function allowOnly(permitted) {
  const permittedSet = new Set(permitted);

  return (props, _, componentName) => {
    const badProps = Object.keys(props).filter((key) => !permittedSet.has(key));
    if (!badProps.length) {
      return null;
    }

    const plural = badProps.length > 1;
    const propNames = badProps.map((key) => `\`${key}\``);

    return new TypeError((
      `The prop${plural ? 's' : ''} ${propNames.join(', ')} ` +
      `${plural ? 'are' : 'is'} not recognised by ${componentName}`
    ));
  };
}

function addUnknownPropsTest(propTypes, { alsoAllow = [] } = {}) {
  return {
    rejectUnknownProps: allowOnly([...Object.keys(propTypes), ...alsoAllow]),
    ...propTypes,
  };
}

function isComponent(o) {
  return (
    typeof o === 'function' ||
    o instanceof React.Component ||
    o instanceof React.PureComponent
  );
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
