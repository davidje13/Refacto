import type { ReactElement } from 'react';
import useAwaited from 'react-hook-awaited';
import { Header } from '../common/Header';
import { useUserData } from '../../hooks/data/useUserData';
import { retroAuthService, retroAuthTracker } from '../../api/api';
import { PasswordForm } from './PasswordForm';
import './PasswordPage.css';

interface PropsT {
  slug: string;
  retroId: string;
}

export const PasswordPage = ({ slug, retroId }: PropsT): ReactElement => {
  const userData = useUserData();
  const checkingUser = useAwaited(
    async (signal) => {
      if (!userData) {
        return;
      }
      const retroAuth = await retroAuthService.getRetroAuthForUser(
        retroId,
        userData.userToken,
        signal,
      );
      retroAuthTracker.set(retroId, retroAuth);
    },
    [userData, retroId, retroAuthService, retroAuthTracker],
  );

  if (userData && checkingUser.state !== 'rejected') {
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
      <PasswordForm slug={slug} retroId={retroId} encourageBrowserSave />
    </article>
  );
};
