import { memo } from 'react';
import { useLocation } from 'wouter';
import { useEvent } from '../../hooks/useEvent';
import type { Retro } from '../../shared/api-entities';
import type { RetroPagePropsT } from '../RetroRouter';
import { Header } from '../common/Header';
import { SettingsForm } from './SettingsForm';

type PropsT = Pick<RetroPagePropsT, 'retro' | 'retroDispatch'>;

export const RetroSettingsPage = memo(({ retro, retroDispatch }: PropsT) => {
  const [, setLocation] = useLocation();

  const handleSave = useEvent((savedRetro: Retro) => {
    setLocation(`/retros/${encodeURIComponent(savedRetro.slug)}`);
  });

  return (
    <article className="page-retro-settings">
      <Header
        documentTitle={`Settings - ${retro.name} - Refacto`}
        title={`${retro.name} Settings`}
        backLink={{
          label: 'Back to Retro',
          action: `/retros/${encodeURIComponent(retro.slug)}`,
        }}
      />
      {retroDispatch ? (
        <SettingsForm
          retro={retro}
          dispatch={retroDispatch}
          onSave={handleSave}
        />
      ) : (
        <div>You cannot edit the settings for this retro.</div>
      )}
    </article>
  );
});
