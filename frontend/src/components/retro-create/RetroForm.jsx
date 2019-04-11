import React from 'react';
import PropTypes from 'prop-types';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import {
  retroService,
  retroTokenService,
  retroTokenTracker,
} from '../../api/api';

class RetroForm extends React.PureComponent {
  static propTypes = {
    onCreate: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      name: '',
      slug: '',
      password: '',
      passwordConf: '',
      sending: false,
      error: null,
    };
  }

  handleSubmit = async (e) => {
    e.preventDefault();

    const {
      name,
      slug,
      password,
      sending,
    } = this.state;

    const { onCreate } = this.props;

    if (!this.valid() || sending) {
      return;
    }

    try {
      this.setState({ sending: true, error: null });
      const retroId = await retroService.create({ name, slug, password });
      const token = await retroTokenService.submitPassword(retroId, password);

      this.setState({ sending: false, error: null });
      retroTokenTracker.set(retroId, token);
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

  handleChangeName = (e) => {
    this.setState({ name: e.target.value });
  };

  handleChangeSlug = (e) => {
    this.setState({ slug: e.target.value });
  };

  handleChangePassword = (e) => {
    this.setState({ password: e.target.value });
  };

  handleChangePasswordConfirmation = (e) => {
    this.setState({ passwordConf: e.target.value });
  };

  valid() {
    const {
      name,
      slug,
      password,
      passwordConf,
    } = this.state;

    return (
      Boolean(name) &&
      Boolean(slug) &&
      Boolean(password) &&
      (passwordConf === password)
    );
  }

  render() {
    const {
      name,
      slug,
      password,
      passwordConf,
      sending,
      error,
    } = this.state;

    const { protocol, host } = document.location;
    const retrosBaseUrl = `${protocol}//${host}/retros/`;

    return (
      <form onSubmit={this.handleSubmit}>
        <input
          name="name"
          type="text"
          placeholder="retro name"
          value={name}
          onChange={this.handleChangeName}
          autoComplete="off"
        />
        { retrosBaseUrl }
        <input
          name="slug"
          type="text"
          placeholder=""
          value={slug}
          onChange={this.handleChangeSlug}
          autoComplete="off"
        />
        <input
          name="password"
          type="password"
          placeholder="password"
          value={password}
          onChange={this.handleChangePassword}
          autoComplete="off"
        />
        <input
          name="password-confirmation"
          type="password"
          placeholder="password-confirmation"
          value={passwordConf}
          onChange={this.handleChangePasswordConfirmation}
          autoComplete="off"
        />
        { sending ? (<div className="sending">&hellip;</div>) : (
          <button type="submit" title="Create Retro" disabled={!this.valid()}>
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

export default React.memo(RetroForm);
