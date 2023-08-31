import { type FC } from 'react';
import { Route, Redirect, HookNavigationOptions, LocationHook } from 'wouter';

const groupRx = /:([A-Za-z0-9_]+)([?+*]?)/g;
const makePath = (
  pattern: string,
  params: Record<string, string | undefined>,
): string => pattern.replace(groupRx, (_, name) => params[name] ?? '');

type RedirectRouteProps = HookNavigationOptions<LocationHook> & {
  path: string;
  to: string;
  children?: never;
};

export const RedirectRoute: FC<RedirectRouteProps> = ({ to, ...props }) =>
  Route({
    children: (params) => <Redirect to={makePath(to, params)} {...props} />,
    ...props,
  });
