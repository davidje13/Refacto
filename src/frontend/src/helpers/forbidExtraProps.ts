import React from 'react';
import type { Validator } from 'prop-types';

// Based vaguely on airbnb prop-types-exact, but with no added dependencies

interface ForbidOptions {
  alsoAllow?: string[];
}

function allowOnly(permitted: string[]): Validator<any> {
  const permittedSet = new Set(permitted);

  return (props: object, _: any, componentName: string): (Error | null) => {
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

function addUnknownPropsTest<T>(
  propTypes: T,
  { alsoAllow = [] }: ForbidOptions = {},
): T {
  let propName = 'rejectUnknownProps';
  while ((propTypes as any)[propName] !== undefined) {
    propName = `rejectUnknownProps_${Math.random()}`;
  }
  return {
    [propName]: allowOnly([...Object.keys(propTypes), ...alsoAllow]),
    ...propTypes,
  };
}

function isComponent(o: unknown): o is React.ComponentType {
  return (typeof o === 'function' || o instanceof React.Component);
}

export default function forbidExtraProps<T>(o: T, options?: ForbidOptions): T {
  if (isComponent(o)) {
    // Called on component; mutate its static propTypes
    const component = o;

    component.propTypes = addUnknownPropsTest(component.propTypes || {}, options);
    return component;
  }

  // Called on propTypes entity; return a copy with the extra tests added
  return addUnknownPropsTest(o, options);
}
