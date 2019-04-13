import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import Header from '../common/Header';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import { slugTracker } from '../../api/api';
import RetroForm from './RetroForm';
import './RetroCreatePage.less';

const RetroCreatePage = ({ defaultSlug, history }) => {
  const handleCreate = useCallback(({ id, slug }) => {
    slugTracker.set(slug, id);
    history.push(`/retros/${slug}`);
  }, [history]);

  return (
    <article className="page-retro-create">
      <Header
        documentTitle="New Retro - Refacto"
        title="New Retro"
        backLink={{ label: 'Home', url: '/' }}
      />
      <RetroForm onCreate={handleCreate} defaultSlug={defaultSlug} />
    </article>
  );
};

RetroCreatePage.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  defaultSlug: PropTypes.string,
};

RetroCreatePage.defaultProps = {
  defaultSlug: null,
};

forbidExtraProps(RetroCreatePage, { alsoAllow: ['location', 'match', 'staticContext'] });

export default React.memo(withRouter(RetroCreatePage));
