import type { FunctionComponent } from 'react';
import { Route, Redirect, type RedirectProps } from 'wouter';

const groupRx = /:([A-Za-z0-9_]+)([?+*]?)/g;
const makePath = (
  pattern: string,
  params: Record<string, string | undefined>,
): string => pattern.replace(groupRx, (_, name) => params[name] ?? '');

type RedirectRouteProps = RedirectProps & {
  to: string;
  path: string;
};

export const RedirectRoute: FunctionComponent<RedirectRouteProps> = ({
  to,
  path,
  ...props
}) =>
  Route({
    children: (params) => <Redirect to={makePath(to, params)} {...props} />,
    path,
  });
