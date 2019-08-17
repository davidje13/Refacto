import React from 'react';
import PropTypes from 'prop-types';
import { Retro } from 'refacto-entities';
import { RetroSpec } from '../../actions/retro';
import { propTypesShapeRetro } from '../../api/dataStructurePropTypes';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import './SettingsForm.less';

interface SaveT {
  id: string;
  slug: string;
}

interface PropsT {
  retro: Retro;
  dispatch: (spec: RetroSpec) => void;
  onSave?: (data: SaveT) => void;
}

interface StateT {
  name: string;
  slug: string;
  sending: boolean;
  error: string | null;
}

class SettingsForm extends React.PureComponent<PropsT, StateT> {
  public static propTypes = {
    retro: propTypesShapeRetro.isRequired,
    dispatch: PropTypes.func.isRequired,
    onSave: PropTypes.func,
  };

  public static defaultProps = {
    onSave: undefined,
  };

  public constructor(props: PropsT) {
    super(props);

    this.state = {
      name: props.retro.name,
      slug: props.retro.slug,
      sending: false,
      error: null,
    };
  }

  public handleSubmit = async (e: React.SyntheticEvent): Promise<void> => {
    e.preventDefault();

    const {
      name,
      slug,
      sending,
    } = this.state;

    const { retro, dispatch, onSave } = this.props;

    if (sending) {
      return;
    }
    if (!name || !slug) {
      return;
    }

    try {
      this.setState({ sending: true, error: null });
      // TODO: await confirmation
      dispatch({
        name: { $set: name },
      });

      this.setState({ sending: false, error: null });
      if (onSave) {
        onSave({ id: retro.id, slug });
      }
    } catch (err) {
      this.setState({ sending: false, error: String(err.message) });
    }
  };

  public handleChangeName = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({ name: e.target.value });
  };

  public render(): React.ReactElement {
    const {
      name,
      sending,
      error,
    } = this.state;

    return (
      <form onSubmit={this.handleSubmit} className="retro-settings">
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
        { sending ? (<div className="sending">&hellip;</div>) : (
          <button type="submit" title="Save Changes">
            Save
          </button>
        ) }
        { error ? (
          <div className="error">{ error }</div>
        ) : null }
      </form>
    );
  }
}

forbidExtraProps(SettingsForm);

export default React.memo(SettingsForm);
