import { memo, useEffect } from 'react';
import type { Retro } from '../../shared/api-entities';
import { isArchivable } from '../../actions/retro';
import type { RetroPagePropsT } from '../RetroRouter';
import { ArchivePopup } from './ArchivePopup';
import { Header, type HeaderLinks } from '../common/Header';
import { useWindowSize, type Size } from '../../hooks/env/useWindowSize';
import { useBoolean } from '../../hooks/useBoolean';
import { OPTIONS } from '../../helpers/optionManager';
import { getRetroFormatDetails } from '../retro-formats/formats';
import { RetroFormat } from '../retro-formats/RetroFormat';
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

    const format = getRetroFormatDetails(retro.format);
    const showCreateArchive =
      format.showCreateArchive &&
      (!smallScreen || OPTIONS.enableMobileFacilitation.read(retro.options));

    const canArchive = Boolean(
      retroDispatch && retro && isArchivable(retro) && !group,
    );

    useEffect(() => {
      if (!canArchive) {
        archivePopupVisible.setFalse();
      }
    }, [canArchive]);

    const onArchive = canArchive ? archivePopupVisible.setTrue : undefined;
    const onInvite = invitePopupVisible.setTrue;
    const archivesLink = retroAuth.scopes.includes('readArchives')
      ? `${basePath}/archives`
      : undefined;
    const settingsLink = retroDispatch ? `${basePath}/settings` : undefined;

    const links: HeaderLinks = [
      onInvite ? { label: 'Invite', action: onInvite } : null,
      settingsLink ? { label: 'Settings', action: settingsLink } : null,
      onArchive && showCreateArchive
        ? { label: 'Create Archive', action: onArchive }
        : null,
      {
        label: 'Archives',
        action: archivesLink ?? '',
        className: 'archives-link',
        disabled: !archivesLink,
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
        <RetroFormat
          className="retro-content"
          retroFormat={retro.format}
          retroOptions={retro.options}
          retroItems={retro.items}
          retroState={getState(group, retro)}
          group={group}
          dispatch={retroDispatch ?? undefined}
          onArchive={onArchive}
          onInvite={onInvite}
          settingsLink={settingsLink}
          archivesLink={archivesLink}
          archive={false}
        />
        {retroDispatch ? (
          <ArchivePopup
            retroToken={retroAuth.retroToken}
            retro={retro}
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
