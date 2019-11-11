import React, { useCallback } from 'react';
import { Retro } from 'refacto-entities';
import Header from '../common/Header';
import Loader from '../common/Loader';
import withRetroTokenForSlug from '../hocs/withRetroTokenForSlug';
import useRetroReducer from '../../hooks/data/useRetroReducer';
import useRouter from '../../hooks/env/useRouter';
import SettingsForm from './SettingsForm';
import './RetroSettingsPage.less';

interface PropsT {
  slug: string;
  retroId: string | null;
  retroToken: string | null;
  retroTokenError?: string | null;
}

const RetroSettingsPage = ({
  slug,
  retroId,
  retroToken,
  retroTokenError,
}: PropsT): React.ReactElement => {
  const { history } = useRouter();

  const [
    retro,
    retroDispatch,
    retroError,
  ] = useRetroReducer(retroId, retroToken);

  const retroName = retro?.name ?? slug;

  const handleSave = useCallback((savedRetro: Retro) => {
    history.push(`/retros/${savedRetro.slug}`);
  }, [history]);

  return (
    <article className="page-retro-settings">
      <Header
        documentTitle={`Settings - ${retroName} - Refacto`}
        title={`${retroName} Settings`}
        backLink={{ label: 'Back to Retro', action: `/retros/${slug}` }}
      />
      <Loader<typeof SettingsForm>
        Component={SettingsForm}
        componentProps={retro ? {
          retro,
          dispatch: retroDispatch!,
          onSave: handleSave,
        } : null}
        error={retroTokenError || retroError}
      />
    </article>
  );
};

RetroSettingsPage.defaultProps = {
  retroTokenError: null,
};

export default React.memo(withRetroTokenForSlug(RetroSettingsPage));
