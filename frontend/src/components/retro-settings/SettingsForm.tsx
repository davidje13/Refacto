import { useState, memo } from 'react';
import { type Retro } from '../../shared/api-entities';
import { type RetroDispatch } from '../../api/RetroTracker';
import { context } from '../../api/reducer';
import { Input } from '../common/Input';
import { PickerInput } from '../common/PickerInput';
import { SlugEntry } from '../retro-create/SlugEntry';
import { Alert } from '../common/Alert';
import { useSubmissionCallback } from '../../hooks/useSubmissionCallback';
import { OPTIONS } from '../../helpers/optionManager';
import { getThemes } from '../retro-formats/mood/categories/FaceIcon';
import './SettingsForm.less';

interface PropsT {
  retro: Retro;
  dispatch: RetroDispatch;
  onSave?: (savedRetro: Retro) => void;
}

export const SettingsForm = memo(({ retro, dispatch, onSave }: PropsT) => {
  const [name, setName] = useState(retro.name);
  const [slug, setSlug] = useState(retro.slug);
  const [alwaysShowAddAction, setAlwaysShowAddAction] = useState(
    OPTIONS.alwaysShowAddAction.read(retro.options),
  );
  const [theme, setTheme] = useState(OPTIONS.theme.read(retro.options));

  const [handleSubmit, sending, error] = useSubmissionCallback(async () => {
    if (!name || !slug) {
      throw new Error('Cannot set blank name or slug');
    }

    const saved = await dispatch.sync([
      {
        name: ['=', name],
        slug: ['=', slug],
        options: context.combine([
          OPTIONS.alwaysShowAddAction.specSet(alwaysShowAddAction),
          OPTIONS.theme.specSet(theme),
        ]),
      },
    ]);
    onSave?.(saved);
  });

  const themeChoices = getThemes().map(([value, detail]) => ({
    value,
    label: (
      <span className="theme-row">
        <span className="name">{detail.name}</span>
        <span className="preview">{detail.icons.happy}</span>
        <span className="preview">{detail.icons.meh}</span>
        <span className="preview">{detail.icons.sad}</span>
      </span>
    ),
  }));

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
          ariaLabel="Retro ID"
          onChange={setSlug}
          oldValue={retro.slug}
          showAvailability
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
        <PickerInput
          className="theme"
          name="theme"
          value={theme}
          onChange={setTheme}
          options={themeChoices}
        />
      </fieldset>
      {sending ? (
        <div className="sending">&hellip;</div>
      ) : (
        <button type="submit" title="Save Changes">
          Save
        </button>
      )}
      <Alert message={error} />
    </form>
  );
});
