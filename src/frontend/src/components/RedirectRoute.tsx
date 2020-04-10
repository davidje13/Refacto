import React, { useLayoutEffect } from 'react';
import { useLocation, Route, RouteProps } from 'wouter';

const groupRx = /:([A-Za-z0-9_]+)([?+*]?)/g;
const makePath = (
  pattern: string,
  params: Record<string, string>,
): string => pattern.replace(groupRx, (_, name) => params[name]);

interface RedirectProps {
  to: string;
  replace?: boolean;
  children?: never;
}

// https://github.com/molefrog/wouter/issues/114
const Redirect = ({ to, replace }: RedirectProps): null => {
  const [, push] = useLocation();
  useLayoutEffect(() => push(to, replace), []);
  return null;
};

type RedirectRouteProps = RedirectProps & RouteProps<{}> & {
  children?: never;
  component?: never;
};

export default ({ to, ...props }: RedirectRouteProps): React.ReactElement | null => Route({
  children: (params) => (<Redirect to={makePath(to, params)} {...props} />),
  ...props,
});
