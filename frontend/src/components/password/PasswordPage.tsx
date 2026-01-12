import type { ReactElement } from 'react';
import useAwaited from 'react-hook-awaited';
import { Header } from '../common/Header';
import { useUserToken } from '../../hooks/data/useUserToken';
import { retroTokenService, retroTokenTracker } from '../../api/api';
import { PasswordForm } from './PasswordForm';
import './PasswordPage.css';

interface PropsT {
  slug: string;
  retroId: string;
}

export const PasswordPage = ({ slug, retroId }: PropsT): ReactElement => {
  const userToken = useUserToken();
  const checkingUser = useAwaited(
    async (signal) => {
      if (!userToken) {
        return;
      }
      const retroToken = await retroTokenService.getRetroTokenForUser(
        retroId,
        userToken,
        signal,
      );
      retroTokenTracker.set(retroId, retroToken);
    },
    [userToken, retroId, retroTokenService, retroTokenTracker],
  );

  if (userToken && checkingUser.state !== 'rejected') {
    return (
      <article className="page-password-user">
        <Header
          documentTitle={`${slug} - Refacto`}
          title={slug}
          backLink={{ label: 'Home', action: '/' }}
        />
        <div className="loader">Loading&hellip;</div>
      </article>
    );
  }

  return (
    <article className="page-password">
      <Header
        documentTitle={`${slug} - Refacto`}
        title={`Password for ${slug}`}
        backLink={{ label: 'Home', action: '/' }}
      />
      <PasswordForm slug={slug} retroId={retroId} />
    </article>
  );
};
