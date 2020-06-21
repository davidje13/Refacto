import React, { useCallback, memo } from 'react';
import { useLocation } from 'wouter';
import type { Retro } from 'refacto-entities';
import type { RetroPagePropsT } from '../RetroRouter';
import Header from '../common/Header';
import SettingsForm from './SettingsForm';
import './RetroSettingsPage.less';

type PropsT = Pick<RetroPagePropsT, 'retro' | 'retroDispatch'>;

export default memo(({
  retro,
  retroDispatch,
}: PropsT) => {
  const [, setLocation] = useLocation();

  const handleSave = useCallback((savedRetro: Retro) => {
    setLocation(`/retros/${savedRetro.slug}`);
  }, [setLocation]);

  return (
    <article className="page-retro-settings">
      <Header
        documentTitle={`Settings - ${retro.name} - Refacto`}
        title={`${retro.name} Settings`}
        backLink={{ label: 'Back to Retro', action: `/retros/${retro.slug}` }}
      />
      { retroDispatch ? (
        <SettingsForm retro={retro} dispatch={retroDispatch} onSave={handleSave} />
      ) : (
        <div>You cannot edit the settings for this retro.</div>
      ) }
    </article>
  );
});
