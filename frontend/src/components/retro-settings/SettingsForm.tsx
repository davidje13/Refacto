import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Retro } from 'refacto-entities';
import Input from '../common/Input';
import { RetroSpec } from '../../actions/retro';
import { propTypesShapeRetro } from '../../api/dataStructurePropTypes';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import useSubmissionCallback from '../../hooks/useSubmissionCallback';
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

const SettingsForm = ({ retro, dispatch, onSave }: PropsT): React.ReactElement => {
  const [name, setName] = useState(retro.name);
  const [slug] = useState(retro.slug);

  const [handleSubmit, sending, error] = useSubmissionCallback(() => {
    if (!name || !slug) {
      throw new Error('Cannot set blank name or slug');
    }

    // TODO: await confirmation
    dispatch({
      name: { $set: name },
    });

    if (onSave) {
      onSave({ id: retro.id, slug });
    }
  }, [name, slug, dispatch, onSave]);

  return (
    <form onSubmit={handleSubmit} className="retro-settings">
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
};

SettingsForm.propTypes = {
  retro: propTypesShapeRetro.isRequired,
  dispatch: PropTypes.func.isRequired,
  onSave: PropTypes.func,
};

SettingsForm.defaultProps = {
  onSave: undefined,
};

forbidExtraProps(SettingsForm);

export default React.memo(SettingsForm);
