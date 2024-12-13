import { useRef, memo } from 'react';
import { type Retro } from '../../shared/api-entities';
import { type RetroPagePropsT } from '../RetroRouter';
import { ArchivePopup } from './ArchivePopup';
import { Header } from '../common/Header';
import { Popup } from '../common/Popup';
import { useEvent } from '../../hooks/useEvent';
import { useWindowSize, type Size } from '../../hooks/env/useWindowSize';
import { useBoolean } from '../../hooks/useBoolean';
import { clearCovered } from '../../actions/retro';
import { archiveService } from '../../api/api';
import { OPTIONS } from '../../helpers/optionManager';
import { RetroFormatPicker } from '../retro-formats/RetroFormatPicker';
import { InvitePopup } from './InvitePopup';
import './RetroPage.less';

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

type PropsT = Pick<
  RetroPagePropsT,
  'retroToken' | 'retro' | 'retroDispatch'
> & {
  group?: string | undefined;
};

const isSmallScreen = ({ width }: Size) => width <= 800;

export const RetroPage = memo(
  ({ retroToken, retro, retroDispatch, group }: PropsT) => {
    const smallScreen = useWindowSize(isSmallScreen);
    const archivePopupVisible = useBoolean(false);
    const invitePopupVisible = useBoolean(false);

    const isArchiving = useRef(false);
    const performArchive = useEvent(() => {
      if (isArchiving.current || group) {
        return;
      }
      isArchiving.current = true;

      archiveService
        .create({ retro, retroToken })
        .then(() => {
          isArchiving.current = false;
          retroDispatch!(clearCovered());
          archivePopupVisible.setFalse();
        })
        .catch((e) => {
          // TODO: report failure to user
          console.error('Failed to create archive', e);
        });
    });

    const canFacilitate =
      !smallScreen || OPTIONS.enableMobileFacilitation.read(retro.options);

    const canArchive = Boolean(
      retroDispatch &&
        retro &&
        retro.items.length > 0 &&
        canFacilitate &&
        !group,
    );

    const links = [
      { label: 'Invite', action: invitePopupVisible.setTrue },
      retroDispatch
        ? {
            label: 'Settings',
            action: `/retros/${encodeURIComponent(retro.slug)}/settings`,
          }
        : null,
      canArchive
        ? { label: 'Create Archive', action: archivePopupVisible.setTrue }
        : null,
      {
        label: 'Archives',
        action: `/retros/${encodeURIComponent(retro.slug)}/archives`,
      },
    ];

    return (
      <article className="page-retro">
        <Header
          documentTitle={`${retro.name} - Refacto`}
          title={retro.name}
          backLink={
            group
              ? {
                  label: 'Main Retro',
                  action: `/retros/${encodeURIComponent(retro.slug)}`,
                }
              : null
          }
          links={retro ? links : []}
        />
        <RetroFormatPicker
          retroFormat={retro.format}
          retroOptions={retro.options}
          retroItems={retro.items}
          retroState={getState(group, retro)}
          group={group}
          dispatch={retroDispatch ?? undefined}
          onComplete={canArchive ? archivePopupVisible.setTrue : undefined}
          archive={false}
        />
        <Popup
          title="Create Archive"
          isOpen={Boolean(retroDispatch) && archivePopupVisible.value}
          keys={{ Enter: performArchive, Escape: archivePopupVisible.setFalse }}
          onClose={archivePopupVisible.setFalse}
        >
          <ArchivePopup
            onConfirm={performArchive}
            onCancel={archivePopupVisible.setFalse}
          />
        </Popup>
        <Popup
          title="Invite"
          hideTitle
          isOpen={invitePopupVisible.value}
          keys={{
            Enter: invitePopupVisible.setFalse,
            Escape: invitePopupVisible.setFalse,
          }}
          onClose={invitePopupVisible.setFalse}
        >
          <InvitePopup onClose={invitePopupVisible.setFalse} />
        </Popup>
      </article>
    );
  },
);
