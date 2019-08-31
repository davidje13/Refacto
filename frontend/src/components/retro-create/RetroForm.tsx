import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import Input from '../common/Input';
import withUserToken from '../hocs/withUserToken';
import useSubmissionCallback from '../../hooks/useSubmissionCallback';
import useNonce from '../../hooks/useNonce';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import {
  slugTracker,
  retroService,
  retroTokenService,
  retroTokenTracker,
  passwordService,
} from '../../api/api';
import './RetroForm.less';

function makeSlug(text: string): string {
  return text.toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9_]+/g, '-')
    .replace(/[-_]{2,}/g, '_')
    .replace(/^[-_]+|[-_]+$/g, '');
}

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

const VALID_SLUG = /^[a-z0-9][a-z0-9_-]*$/;
const MIN_PASSWORD_LENGTH = 8;

enum SlugAvailability {
  BLANK,
  INVALID,
  CHECKING,
  FAILED,
  TAKEN,
  AVAILABLE,
}

const RetroForm = ({
  defaultSlug,
  userToken,
  onCreate,
}: PropsT): React.ReactElement => {
  const [name, setNameRaw] = useState(defaultSlug || '');
  const [slug, setSlugRaw] = useState(defaultSlug || '');
  const [password, setPassword] = useState('');
  const [passwordConf, setPasswordConfRaw] = useState('');
  const [passwordWarning, setPasswordWarning] = useState<string | null>(null);
  const [slugAvailability, setSlugAvailability] = useState(SlugAvailability.BLANK);

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
  ]);

  const checkSlugNonce = useNonce();
  const checkSlug = useCallback(async (current: string) => {
    const nonce = checkSlugNonce.next();

    if (current === '') {
      setSlugAvailability(SlugAvailability.BLANK);
      return;
    }
    if (!VALID_SLUG.test(current)) {
      setSlugAvailability(SlugAvailability.INVALID);
      return;
    }

    setSlugAvailability(SlugAvailability.CHECKING);
    try {
      const available = await slugTracker.isAvailable(current);
      if (!checkSlugNonce.check(nonce)) {
        return;
      }
      if (available) {
        setSlugAvailability(SlugAvailability.AVAILABLE);
      } else {
        setSlugAvailability(SlugAvailability.TAKEN);
      }
    } catch (err) {
      setSlugAvailability(SlugAvailability.FAILED);
    }
  }, [checkSlugNonce, slugTracker, setSlugAvailability]);

  const setSlug = useCallback((current: string) => {
    setSlugRaw(current);

    if (current === '') {
      checkSlug(makeSlug(name));
    } else {
      checkSlug(current);
    }
  }, [setSlugRaw, name, checkSlug]);

  const setName = useCallback(async (current: string) => {
    setNameRaw(current);

    if (slug === '') {
      checkSlug(makeSlug(current));
    }
  }, [setNameRaw, slug, checkSlug]);

  const [handleSubmit, sending, error] = useSubmissionCallback(async () => {
    const resolvedSlug = slug || makeSlug(name);
    if (!name || !password || !resolvedSlug) {
      throw new Error('Must specify name, password and URL');
    }

    if (password !== passwordConf) {
      throw new Error('Passwords do not match');
    }

    const retroId = await retroService.create({
      name,
      slug: resolvedSlug,
      password,
      userToken,
    });
    const retroToken = await retroTokenService.submitPassword(
      retroId,
      password,
    );

    retroTokenTracker.set(retroId, retroToken);
    onCreate({
      id: retroId,
      slug: resolvedSlug,
      name,
      password,
    });
  }, [name, slug, password, passwordConf, userToken, onCreate]);

  const retrosBaseUrl = `${document.location.host}/retros/`;

  let slugChecker;
  switch (slugAvailability) {
    case SlugAvailability.INVALID:
      slugChecker = (
        <div className="slug-checker invalid">
          { 'Invalid \u20E0' }
        </div>
      );
      break;
    case SlugAvailability.CHECKING:
      slugChecker = (
        <div className="slug-checker checking" />
      );
      break;
    case SlugAvailability.FAILED:
      slugChecker = (
        <div className="slug-checker failed">
          { 'Unable to check availability' }
        </div>
      );
      break;
    case SlugAvailability.TAKEN:
      slugChecker = (
        <div className="slug-checker taken">
          { 'Taken \u20E0' }
        </div>
      );
      break;
    case SlugAvailability.AVAILABLE:
      slugChecker = (
        <div className="slug-checker available">
          { 'Available \u2713' }
        </div>
      );
      break;
    default:
      slugChecker = null;
      break;
  }

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
        <div className="prefixed-input">
          <span className="prefix">{ retrosBaseUrl }</span>
          <Input
            name="slug"
            type="text"
            placeholder={makeSlug(name)}
            value={slug}
            onChange={setSlug}
            pattern="^[a-z0-9][a-z0-9_-]*$"
          />
          <div className="slug-checker">
            { slugChecker }
          </div>
        </div>
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
