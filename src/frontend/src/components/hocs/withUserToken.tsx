import { ComponentType, ReactElement } from 'react';
import { LoginForm } from '../login/LoginForm';
import { useUserToken } from '../../hooks/data/useUserToken';

interface ChildPropsT {
  userToken: string;
}

type WrapperProps<P> = Omit<P, 'userToken'>;

export const withUserToken =
  <P extends ChildPropsT>(message: string, Component: ComponentType<P>) =>
  (params: WrapperProps<P>): ReactElement => {
    const [userToken] = useUserToken();

    if (!userToken) {
      return <LoginForm message={message} />;
    }

    const AnyComponent = Component as ComponentType<any>;
    return <AnyComponent userToken={userToken} {...params} />;
  };
