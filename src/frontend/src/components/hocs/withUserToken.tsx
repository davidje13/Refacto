import React from 'react';
import LoginForm from '../login/LoginForm';
import useUserToken from '../../hooks/data/useUserToken';

interface ChildPropsT {
  userToken: string;
}

type WrapperProps<P> = Omit<P, 'userToken'>;

export default <P extends ChildPropsT>(
    message: string,
    Component: React.ComponentType<P>,
  ) =>
  (params: WrapperProps<P>): React.ReactElement => {
    const [userToken] = useUserToken();

    if (!userToken) {
      return <LoginForm message={message} />;
    }

    const AnyComponent = Component as React.ComponentType<any>;
    return <AnyComponent userToken={userToken} {...params} />;
  };
