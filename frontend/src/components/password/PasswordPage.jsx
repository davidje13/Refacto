import React from 'react';
import PropTypes from 'prop-types';
import Header from '../common/Header';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import { retroTokenService, retroTokenTracker } from '../../api/api';
import './PasswordPage.less';

class PasswordPage extends React.PureComponent {
  static propTypes = {
    slug: PropTypes.string.isRequired,
    retroId: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      password: '',
      checking: false,
      error: null,
    };
  }

  handleSubmit = async (e) => {
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

  handleChangePassword = (e) => {
    this.setState({ password: e.target.value });
  };

  render() {
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
            disabled={this.checking}
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
