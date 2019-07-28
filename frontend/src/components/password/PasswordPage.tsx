import React from 'react';
import PropTypes from 'prop-types';
import Header from '../common/Header';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import { retroTokenService, retroTokenTracker } from '../../api/api';
import './PasswordPage.less';

interface PropsT {
  slug: string;
  retroId: string;
}

interface StateT {
  password: string;
  checking: boolean;
  error: string | null;
}

class PasswordPage extends React.PureComponent<PropsT, StateT> {
  public static propTypes = {
    slug: PropTypes.string.isRequired,
    retroId: PropTypes.string.isRequired,
  };

  public constructor(props: PropsT) {
    super(props);

    this.state = {
      password: '',
      checking: false,
      error: null,
    };
  }

  public handleSubmit = async (e: React.SyntheticEvent): Promise<void> => {
    e.preventDefault();

    const { retroId } = this.props;
    const { password, checking } = this.state;
    if (!password || checking) {
      return;
    }

    try {
      this.setState({ checking: true, error: null });
      const retroToken = await retroTokenService.submitPassword(retroId, password);

      this.setState({ checking: false, error: null });
      retroTokenTracker.set(retroId, retroToken);
    } catch (err) {
      this.setState({ checking: false, error: String(err.message) });
    }
  };

  public handleChangePassword = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({ password: e.target.value });
  };

  public render(): React.ReactElement {
    const { slug } = this.props;
    const { password, checking, error } = this.state;

    return (
      <article className="page-password">
        <Header
          documentTitle={`${slug} - Refacto`}
          title={`Password for ${slug}`}
        />
        <form onSubmit={this.handleSubmit}>
          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={this.handleChangePassword}
            disabled={checking}
            autoComplete="off"
          />
          { checking ? (<div className="checking">&hellip;</div>) : (
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
  }
}

forbidExtraProps(PasswordPage);

export default PasswordPage;
