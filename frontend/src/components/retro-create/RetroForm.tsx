import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import Input from '../common/Input';
import SlugEntry, { MAX_SLUG_LENGTH } from './SlugEntry';
import withUserToken from '../hocs/withUserToken';
import useSubmissionCallback from '../../hooks/useSubmissionCallback';
import useNonce from '../../hooks/useNonce';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import {
  retroService,
  retroTokenTracker,
  passwordService,
} from '../../api/api';
import './RetroForm.less';

interface CreationT {
  id: string;
  name: string;
  slug: string;
  password: string;
}

interface PropsT {
  defaultSlug?: string;
  userToken: string;
  onCreate: (data: CreationT) => void;
}

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 512;

function makeSlug(text: string): string {
  return text.toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9_]+/g, '-')
    .replace(/[-_]{2,}/g, '_')
    .replace(/^[-_]+|[-_]+$/g, '')
    .substr(0, MAX_SLUG_LENGTH);
}

const RetroForm = ({
  defaultSlug,
  userToken,
  onCreate,
}: PropsT): React.ReactElement => {
  const [name, setName] = useState(defaultSlug || '');
  const [slug, setSlug] = useState(defaultSlug || '');
  const [password, setPassword] = useState('');
  const [passwordConf, setPasswordConfRaw] = useState('');
  const [passwordWarning, setPasswordWarning] = useState<string | null>(null);

  const passwordCheckNonce = useNonce();
  const setPasswordConf = useCallback(async (current: string) => {
    const nonce = passwordCheckNonce.next();
    setPasswordConfRaw(current);
    setPasswordWarning(null);

    if (password !== current) {
      return;
    }

    if (current.length < MIN_PASSWORD_LENGTH) {
      setPasswordWarning('This password is too short');
      return;
    }
    if (current.length > MAX_PASSWORD_LENGTH) {
      setPasswordWarning('This password is too long');
      return;
    }

    try {
      const count = await passwordService.countPasswordBreaches(current);
      if (!passwordCheckNonce.check(nonce)) {
        return;
      }
      if (count > 100) {
        setPasswordWarning('This password is very common and insecure');
      } else if (count > 20) {
        setPasswordWarning('This password is common and insecure');
      } else if (count > 0) {
        setPasswordWarning('This password may be insecure');
      }
    } catch (err) {
      // ignore
    }
  }, [
    password,
    setPasswordConfRaw,
    passwordCheckNonce,
    setPasswordWarning,
    passwordService,
    MIN_PASSWORD_LENGTH,
    MAX_PASSWORD_LENGTH,
  ]);

  const [handleSubmit, sending, error] = useSubmissionCallback(async () => {
    const resolvedSlug = slug || makeSlug(name);
    if (!name || !password || !resolvedSlug) {
      throw new Error('Must specify name, password and URL');
    }

    if (password !== passwordConf) {
      throw new Error('Passwords do not match');
    }

    const { id, token } = await retroService.create({
      name,
      slug: resolvedSlug,
      password,
      userToken,
    });

    retroTokenTracker.set(id, token);
    onCreate({
      id,
      slug: resolvedSlug,
      name,
      password,
    });
  }, [name, slug, password, passwordConf, userToken, onCreate]);

  return (
    <form onSubmit={handleSubmit} className="create-retro">
      <label>
        Retro Name
        <Input
          name="name"
          type="text"
          placeholder="retro name"
          value={name}
          onChange={setName}
          required
        />
      </label>
      <label>
        Retro URL
        <div className="info">
          (may contain lowercase letters, numbers, dashes and underscores)
        </div>
        <SlugEntry
          placeholder={makeSlug(name)}
          value={slug}
          onChange={setSlug}
        />
      </label>
      <label>
        Collaborator password
        <Input
          name="password"
          type="password"
          placeholder="password"
          value={password}
          onChange={setPassword}
          minLength={MIN_PASSWORD_LENGTH}
          maxLength={MAX_PASSWORD_LENGTH}
          required
        />
      </label>
      <label>
        Confirm password
        <Input
          name="password-confirmation"
          type="password"
          placeholder="password"
          value={passwordConf}
          onChange={setPasswordConf}
          required
        />
      </label>
      { passwordWarning ? (
        <div className="warning">
          { `${passwordWarning} \u2014 ` }
          <a
            href="/security#passwords"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn more
          </a>
        </div>
      ) : null }
      { sending ? (<div className="sending">&hellip;</div>) : (
        <button type="submit" title="Create Retro">
          Create
        </button>
      ) }
      { error ? (
        <div className="error">{ error }</div>
      ) : null }
    </form>
  );
};

RetroForm.propTypes = {
  userToken: PropTypes.string.isRequired,
  onCreate: PropTypes.func.isRequired,
  defaultSlug: PropTypes.string,
};

RetroForm.defaultProps = {
  defaultSlug: undefined,
};

forbidExtraProps(RetroForm);

export default React.memo(withUserToken(RetroForm, 'Sign in to create a retro'));
