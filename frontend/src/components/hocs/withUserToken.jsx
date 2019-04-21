import React from 'react';
import LoginForm from '../login/LoginForm';
import useUserToken from '../../hooks/data/useUserToken';

export default function withUserToken(Component, message = 'Sign in') {
  return (params) => {
    const [userToken] = useUserToken();

    if (!userToken) {
      return (<LoginForm message={message} />);
    }

    return (<Component userToken={userToken} {...params} />);
  };
}
