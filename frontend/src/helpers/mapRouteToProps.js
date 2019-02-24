function makeMappingFunction(mapping) {
  if (typeof mapping === 'function') {
    return mapping;
  }

  return (match) => {
    const result = {};
    Object.keys(mapping).forEach((prop) => {
      const paramName = mapping[prop];
      result[prop] = match.params[paramName];
    });
    return result;
  };
}

// Takes either:
// - a function (match, location, history) -> {props} or
// - an object of {propName: 'paramName'}

export default function mapRouteToProps(mapping) {
  const fn = makeMappingFunction(mapping);

  return (stateProps, dispatchProps, ownProps) => {
    const routeProps = fn(ownProps.match, ownProps.location, ownProps.history);

    const baseProps = Object.assign({}, ownProps);
    delete baseProps.match;
    delete baseProps.location;
    delete baseProps.history;
    // https://github.com/ReactTraining/react-router/issues/4683
    delete baseProps.staticContext;

    return Object.assign(baseProps, routeProps, stateProps, dispatchProps);
  };
}
