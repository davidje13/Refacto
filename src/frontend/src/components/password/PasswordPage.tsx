import React, { useState, useLayoutEffect } from 'react';
import Header from '../common/Header';
import Input from '../common/Input';
import useSubmissionCallback from '../../hooks/useSubmissionCallback';
import useUserToken from '../../hooks/data/useUserToken';
import { retroTokenService, retroTokenTracker } from '../../api/api';
import Alert from '../common/Alert';
import './PasswordPage.less';

interface PropsT {
  slug: string;
  retroId: string;
}

export default ({
  slug,
  retroId,
}: PropsT): React.ReactElement => {
  const [password, setPassword] = useState('');
  const [userToken] = useUserToken();
  const [checkingUser, setCheckingUser] = useState(false);

  const [handleSubmit, sending, error] = useSubmissionCallback(async () => {
    if (!password) {
      throw new Error('Enter a password');
    }

    const retroToken = await retroTokenService.getRetroTokenForPassword(
      retroId,
      password,
    );
    retroTokenTracker.set(retroId, retroToken);
  }, [password, retroId, retroTokenService, retroTokenTracker]);

  useLayoutEffect(() => {
    if (!userToken) {
      setCheckingUser(false);
      return;
    }

    setCheckingUser(true);
    retroTokenService
      .getRetroTokenForUser(retroId, userToken)
      .then((retroToken) => {
        retroTokenTracker.set(retroId, retroToken);
        setCheckingUser(false);
      })
      .catch(() => {
        setCheckingUser(false);
      });
  }, [userToken, setCheckingUser, retroId, retroTokenService, retroTokenTracker]);

  if (checkingUser) {
    return (
      <article className="page-password-user">
        <Header documentTitle={`${slug} - Refacto`} title={slug} />
        <div className="loader">Loading&hellip;</div>
      </article>
    );
  }

  return (
    <article className="page-password">
      <Header
        documentTitle={`${slug} - Refacto`}
        title={`Password for ${slug}`}
      />
      <form onSubmit={handleSubmit}>
        <Input
          type="password"
          placeholder="password"
          value={password}
          onChange={setPassword}
          disabled={sending}
        />
        { sending ? (<div className="checking">&hellip;</div>) : (
          <button type="submit" title="Go" disabled={password === ''}>
            Go
          </button>
        ) }
        <Alert message={error} />
      </form>
    </article>
  );
};
