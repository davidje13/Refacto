import { memo, useEffect } from 'react';
import type { Retro } from '../../shared/api-entities';
import type { RetroPagePropsT } from '../RetroRouter';
import { ArchivePopup } from './ArchivePopup';
import { Header, type HeaderLinks } from '../common/Header';
import { useWindowSize, type Size } from '../../hooks/env/useWindowSize';
import { useBoolean } from '../../hooks/useBoolean';
import { OPTIONS } from '../../helpers/optionManager';
import { RetroFormatPicker } from '../retro-formats/RetroFormatPicker';
import { InvitePopup } from './InvitePopup';
import './RetroPage.css';

const BLANK_STATE = {};

function getState<T>(
  group: string | undefined,
  retro: Retro<T>,
): T | Record<string, never> {
  if (!group) {
    return retro.state;
  }
  return retro.groupStates[group] || BLANK_STATE;
}

type PropsT = Pick<RetroPagePropsT, 'retroAuth' | 'retro' | 'retroDispatch'> & {
  group?: string | undefined;
};

const isSmallScreen = ({ width }: Size) => width <= 800;

export const RetroPage = memo(
  ({ retroAuth, retro, retroDispatch, group }: PropsT) => {
    const smallScreen = useWindowSize(isSmallScreen);
    const archivePopupVisible = useBoolean(false);
    const invitePopupVisible = useBoolean(false);
    const basePath = `/retros/${encodeURIComponent(retro.slug)}`;

    const canFacilitate =
      !smallScreen || OPTIONS.enableMobileFacilitation.read(retro.options);

    const canArchive = Boolean(
      retroDispatch &&
      retro &&
      retro.items.length > 0 &&
      canFacilitate &&
      !group,
    );

    useEffect(() => {
      if (!canArchive) {
        archivePopupVisible.setFalse();
      }
    }, [canArchive]);

    const links: HeaderLinks = [
      { label: 'Invite', action: invitePopupVisible.setTrue },
      retroDispatch
        ? { label: 'Settings', action: `${basePath}/settings` }
        : null,
      canArchive
        ? { label: 'Create Archive', action: archivePopupVisible.setTrue }
        : null,
      {
        label: 'Archives',
        action: `${basePath}/archives`,
        className: 'archives-link',
        disabled: !retroAuth.scopes.includes('readArchives'),
      },
    ];

    return (
      <article className="page-retro">
        <Header
          documentTitle={`${retro.name} - Refacto`}
          title={retro.name}
          backLink={group ? { label: 'Main Retro', action: basePath } : null}
          links={retro ? links : []}
        />
        <RetroFormatPicker
          className="retro-content"
          retroFormat={retro.format}
          retroOptions={retro.options}
          retroItems={retro.items}
          retroState={getState(group, retro)}
          group={group}
          dispatch={retroDispatch ?? undefined}
          onComplete={canArchive ? archivePopupVisible.setTrue : undefined}
          archive={false}
        />
        {retroDispatch ? (
          <ArchivePopup
            retroToken={retroAuth.retroToken}
            retro={retro}
            retroDispatch={retroDispatch}
            isOpen={canArchive && archivePopupVisible.value}
            onClose={archivePopupVisible.setFalse}
          />
        ) : null}
        <InvitePopup
          isOpen={invitePopupVisible.value}
          onClose={invitePopupVisible.setFalse}
          pathname={basePath}
        />
      </article>
    );
  },
);
