import React, { useState, memo } from 'react';
import type { Retro } from 'refacto-entities';
import { actionsSyncedCallback } from 'shared-reducer-frontend';
import type { RetroDispatch } from '../../api/RetroTracker';
import Input from '../common/Input';
import SlugEntry from '../retro-create/SlugEntry';
import Alert from '../common/Alert';
import useSubmissionCallback from '../../hooks/useSubmissionCallback';
import OPTIONS from '../../helpers/optionManager';
import { getThemes } from '../retro-formats/mood/categories/FaceIcon';
import './SettingsForm.less';

interface PropsT {
  retro: Retro;
  dispatch: RetroDispatch;
  onSave?: (savedRetro: Retro) => void;
}

export default memo(({
  retro,
  dispatch,
  onSave,
}: PropsT) => {
  const [name, setName] = useState(retro.name);
  const [slug, setSlug] = useState(retro.slug);
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

    dispatch([
      {
        name: ['=', name],
        slug: ['=', slug],
        options: [
          'seq',
          OPTIONS.alwaysShowAddAction.specSet(alwaysShowAddAction),
          OPTIONS.theme.specSet(theme),
        ],
      },
      actionsSyncedCallback(onSave),
    ]);
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
        Retro URL
        <div className="info">
          (may contain lowercase letters, numbers, dashes and underscores)
        </div>
        <SlugEntry
          value={slug}
          onChange={setSlug}
          oldValue={retro.slug}
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
      <Alert message={error} />
    </form>
  );
});
