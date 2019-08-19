import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Header from '../common/Header';
import Input from '../common/Input';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import useSubmissionCallback from '../../hooks/useSubmissionCallback';
import { retroTokenService, retroTokenTracker } from '../../api/api';
import './PasswordPage.less';

interface PropsT {
  slug: string;
  retroId: string;
}

const PasswordPage = ({ slug, retroId }: PropsT): React.ReactElement => {
  const [password, setPassword] = useState('');

  const [handleSubmit, sending, error] = useSubmissionCallback(async () => {
    if (!password) {
      throw new Error('Enter a password');
    }

    const retroToken = await retroTokenService.submitPassword(
      retroId,
      password,
    );
    retroTokenTracker.set(retroId, retroToken);
  }, [password, retroId, retroTokenService, retroTokenTracker]);

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
        { error ? (
          <div className="error">{ error }</div>
        ) : null }
      </form>
    </article>
  );
};

PasswordPage.propTypes = {
  slug: PropTypes.string.isRequired,
  retroId: PropTypes.string.isRequired,
};

forbidExtraProps(PasswordPage);

export default PasswordPage;
