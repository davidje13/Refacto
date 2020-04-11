import React from 'react';
import LoginForm from '../login/LoginForm';
import useUserToken from '../../hooks/data/useUserToken';

type Unwrapped<P> = Omit<P, 'userToken'>;

export default function withUserToken<P>(
  message: string,
  Component: React.ComponentType<P>,
): React.ComponentType<Unwrapped<P>> {
  return (params): React.ReactElement => {
    const [userToken] = useUserToken();

    if (!userToken) {
      return (<LoginForm message={message} />);
    }

    const AnyComponent = Component as React.ComponentType<any>;
    return (<AnyComponent userToken={userToken} {...params} />);
  };
}
