import React, { useCallback } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import Header from '../common/Header';
import Loader from '../common/Loader';
import withRetroTokenForSlug from '../hocs/withRetroTokenForSlug';
import useRetroReducer from '../../hooks/data/useRetroReducer';
import { slugTracker } from '../../api/api';
import SettingsForm from './SettingsForm';
import './RetroSettingsPage.less';

interface PropsT extends RouteComponentProps {
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
  history,
}: PropsT): React.ReactElement => {
  const [
    retro,
    retroDispatch,
    retroError,
  ] = useRetroReducer(retroId, retroToken);

  const retroName = retro ? retro.name : slug; // TODO TypeScript#16

  const handleSave = useCallback(({ id, slug: newSlug }) => {
    slugTracker.set(newSlug, id);
    history.push(`/retros/${newSlug}`);
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

export default React.memo(withRetroTokenForSlug(withRouter(RetroSettingsPage)));
