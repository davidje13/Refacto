import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Retro } from 'refacto-entities';
import Input from '../common/Input';
import { RetroSpec } from '../../actions/retro';
import useSubmissionCallback from '../../hooks/useSubmissionCallback';
import { propTypesShapeRetro } from '../../api/dataStructurePropTypes';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import OPTIONS from '../../helpers/optionManager';
import './SettingsForm.less';
import { getThemes } from '../retro-formats/mood/categories/FaceIcon';

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
  const [alwaysShowAddAction, setAlwaysShowAddAction] = useState(
    OPTIONS.alwaysShowAddAction.read(retro.options),
  );
  const [theme, setTheme] = useState(
    OPTIONS.theme.read(retro.options),
  );

  const [handleSubmit, sending, error] = useSubmissionCallback(() => {
    if (!name || !slug) {
      throw new Error('Cannot set blank name or slug');
    }

    // TODO: await confirmation
    dispatch({
      name: { $set: name },
      options: {
        $seq: [
          OPTIONS.alwaysShowAddAction.specSet(alwaysShowAddAction),
          OPTIONS.theme.specSet(theme),
        ],
      },
    });

    if (onSave) {
      onSave({ id: retro.id, slug });
    }
  }, [name, slug, alwaysShowAddAction, theme, dispatch, onSave]);

  const themeChoices = getThemes().map(([value, detail]) => (
    <label key={value}>
      <Input
        name="theme"
        type="radio"
        value={value}
        selected={theme}
        onChange={setTheme}
      />
      <span className="fixed-column">{ detail.name }</span>
      { ` ${detail.icons.happy} ${detail.icons.meh} ${detail.icons.sad}` }
    </label>
  ));

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
      <label>
        <Input
          name="always-show-add-action"
          type="checkbox"
          checked={alwaysShowAddAction}
          onChange={setAlwaysShowAddAction}
        />
        Sticky &ldquo;add action&rdquo; input
      </label>
      <fieldset>
        <legend>Theme</legend>
        { themeChoices }
      </fieldset>
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
