import React, { useCallback, memo } from 'react';
import { useLocation } from 'wouter';
import type { Retro } from 'refacto-entities';
import Header from '../common/Header';
import Loader from '../common/Loader';
import withRetroTokenForSlug from '../hocs/withRetroTokenForSlug';
import useRetroReducer from '../../hooks/data/useRetroReducer';
import SettingsForm from './SettingsForm';
import './RetroSettingsPage.less';

export default memo(withRetroTokenForSlug(({
  slug,
  retroId,
  retroToken,
  retroTokenError,
}) => {
  const [, setLocation] = useLocation();

  const [
    retro,
    retroDispatch,
    retroError,
  ] = useRetroReducer(retroId, retroToken);

  const retroName = retro?.name ?? slug;

  const handleSave = useCallback((savedRetro: Retro) => {
    setLocation(`/retros/${savedRetro.slug}`);
  }, [setLocation]);

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
}));
