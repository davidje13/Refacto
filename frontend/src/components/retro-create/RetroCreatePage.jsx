import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import Header from '../common/Header';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import RetroForm from './RetroForm';
import './RetroCreatePage.less';

const RetroCreatePage = ({ history }) => {
  const handleCreate = useCallback(({ slug }) => {
    history.push(`/retros/${slug}`);
  }, [history]);

  return (
    <article className="page-retro-create">
      <Header
        documentTitle="New Retro - Refacto"
        title="New Retro"
        backLink={{ label: 'Home', url: '/' }}
      />
      <RetroForm onCreate={handleCreate} />
    </article>
  );
};

RetroCreatePage.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

forbidExtraProps(RetroCreatePage, { alsoAllow: ['location', 'match', 'staticContext'] });

export default React.memo(withRouter(RetroCreatePage));
