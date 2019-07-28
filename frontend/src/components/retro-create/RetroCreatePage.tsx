import React, { useCallback } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import Header from '../common/Header';
import { slugTracker } from '../../api/api';
import RetroForm from './RetroForm';
import './RetroCreatePage.less';

interface PropsT extends RouteComponentProps {
  defaultSlug?: string;
}

const RetroCreatePage = ({ defaultSlug, history }: PropsT): React.ReactElement => {
  const handleCreate = useCallback(({ id, slug }) => {
    slugTracker.set(slug, id);
    history.push(`/retros/${slug}`);
  }, [history]);

  return (
    <article className="page-retro-create">
      <Header
        documentTitle="New Retro - Refacto"
        title="New Retro"
        backLink={{ label: 'Home', action: '/' }}
      />
      <RetroForm onCreate={handleCreate} defaultSlug={defaultSlug} />
    </article>
  );
};

export default React.memo(withRouter(RetroCreatePage));
