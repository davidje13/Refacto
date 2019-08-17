import React from 'react';
import PropTypes from 'prop-types';
import withUserToken from '../hocs/withUserToken';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import {
  retroService,
  retroTokenService,
  retroTokenTracker,
} from '../../api/api';
import countPasswordBreaches from '../../api/PasswordChecker';
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

interface StateT {
  name: string;
  slug: string;
  password: string;
  passwordConf: string;
  sending: boolean;
  passwordWarning: string | null;
  error: string | null;
}

const MIN_PASSWORD_LENGTH = 8;

class RetroForm extends React.PureComponent<PropsT, StateT> {
  public static propTypes = {
    userToken: PropTypes.string.isRequired,
    onCreate: PropTypes.func.isRequired,
    defaultSlug: PropTypes.string,
  };

  public static defaultProps = {
    defaultSlug: undefined,
  };

  public constructor(props: PropsT) {
    super(props);

    this.state = {
      name: props.defaultSlug || '',
      slug: props.defaultSlug || '',
      password: '',
      passwordConf: '',
      sending: false,
      passwordWarning: null,
      error: null,
    };
  }

  public handleSubmit = async (e: React.SyntheticEvent): Promise<void> => {
    e.preventDefault();

    const {
      name,
      password,
      passwordConf,
      sending,
    } = this.state;

    let { slug } = this.state;

    const { onCreate, userToken } = this.props;

    if (sending) {
      return;
    }
    if (!name || !password) {
      return;
    }
    if (!slug) {
      slug = makeSlug(name);
    }
    if (!slug) {
      return;
    }

    if (password !== passwordConf) {
      this.setState({ sending: false, error: 'Passwords do not match' });
      return;
    }

    try {
      this.setState({ sending: true, error: null });
      const retroId = await retroService.create({
        name,
        slug,
        password,
        userToken,
      });
      const retroToken = await retroTokenService.submitPassword(retroId, password);

      this.setState({ sending: false, error: null });
      retroTokenTracker.set(retroId, retroToken);
      onCreate({
        id: retroId,
        slug,
        name,
        password,
      });
    } catch (err) {
      this.setState({ sending: false, error: String(err.message) });
    }
  };

  public handleChangeName = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({ name: e.target.value });
  };

  public handleChangeSlug = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({ slug: e.target.value });
  };

  public handleChangePassword = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({ password: e.target.value, passwordWarning: null });
  };

  public handleChangePasswordConfirmation = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const current = e.target.value;
    const { password, passwordConf } = this.state;
    if (passwordConf === current) {
      return;
    }
    this.setState({ passwordConf: e.target.value, passwordWarning: null });
    if (password !== current) {
      return;
    }
    if (current.length < MIN_PASSWORD_LENGTH) {
      this.setState({ passwordWarning: 'This password is too short' });
      return;
    }

    try {
      const count = await countPasswordBreaches(current);
      const { password: updatedPassword } = this.state;
      if (updatedPassword !== current) {
        return;
      }
      if (count > 100) {
        this.setState({ passwordWarning: 'This password is very common and insecure' });
      } else if (count > 20) {
        this.setState({ passwordWarning: 'This password is common and insecure' });
      } else if (count > 0) {
        this.setState({ passwordWarning: 'This password may be insecure' });
      }
    } catch (err) {
      // ignore
    }
  };

  public render(): React.ReactElement {
    const {
      name,
      slug,
      password,
      passwordConf,
      sending,
      passwordWarning,
      error,
    } = this.state;

    const retrosBaseUrl = `${document.location.host}/retros/`;

    return (
      <form onSubmit={this.handleSubmit} className="create-retro">
        <label>
          Retro Name
          <input
            name="name"
            type="text"
            placeholder="retro name"
            value={name}
            onChange={this.handleChangeName}
            autoComplete="off"
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
            <input
              name="slug"
              type="text"
              placeholder={makeSlug(name)}
              value={slug}
              onChange={this.handleChangeSlug}
              autoComplete="off"
              pattern="^[a-z0-9][a-z0-9_-]*$"
            />
          </div>
        </label>
        <label>
          Collaborator password
          <input
            name="password"
            type="password"
            placeholder="password"
            value={password}
            onChange={this.handleChangePassword}
            autoComplete="off"
            minLength={MIN_PASSWORD_LENGTH}
            required
          />
        </label>
        <label>
          Confirm password
          <input
            name="password-confirmation"
            type="password"
            placeholder="password"
            value={passwordConf}
            onChange={this.handleChangePasswordConfirmation}
            autoComplete="off"
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
  }
}

forbidExtraProps(RetroForm);

export default React.memo(withUserToken(RetroForm, 'Sign in to create a retro'));
