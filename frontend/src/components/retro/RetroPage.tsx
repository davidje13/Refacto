import { useState, useRef, memo } from 'react';
import { type Retro } from '../../shared/api-entities';
import { type RetroPagePropsT } from '../RetroRouter';
import { ArchivePopup } from './ArchivePopup';
import { Header } from '../common/Header';
import { Popup, PopupData } from '../common/Popup';
import { useEvent } from '../../hooks/useEvent';
import { useWindowSize, type Size } from '../../hooks/env/useWindowSize';
import { clearCovered } from '../../actions/retro';
import { archiveService } from '../../api/api';
import { OPTIONS } from '../../helpers/optionManager';
import { RetroFormatPicker } from '../retro-formats/RetroFormatPicker';
import { InvitePopup } from './InvitePopup';
import './RetroPage.less';

const BLANK_STATE = {};

function getState<T>(retro: Retro<T>, group: string | undefined): T {
  if (!group) {
    return retro.state;
  }
  return retro.groupStates[group] || (BLANK_STATE as T);
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
    const [archivePopupVisible, setArchivePopupVisible] = useState(false);
    const showArchivePopup = useEvent(() => setArchivePopupVisible(true));
    const hideArchivePopup = useEvent(() => setArchivePopupVisible(false));
    const [invitePopupVisible, setInvitePopupVisible] = useState(false);
    const showInvitePopup = useEvent(() => setInvitePopupVisible(true));
    const hideInvitePopup = useEvent(() => setInvitePopupVisible(false));

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
          hideArchivePopup();
        })
        .catch((e) => {
          // TODO: report failure to user
          console.error('Failed to create archive', e);
        });
    });

    const canFacilitate =
      !smallScreen || OPTIONS.enableMobileFacilitation.read(retro.options);

    let archivePopup: PopupData | null = null;
    if (retroDispatch && archivePopupVisible) {
      archivePopup = {
        title: 'Create Archive',
        content: (
          <ArchivePopup
            onConfirm={performArchive}
            onCancel={hideArchivePopup}
          />
        ),
        keys: {
          Enter: performArchive,
          Escape: hideArchivePopup,
        },
      };
    }

    let invitePopup: PopupData | null = null;
    if (invitePopupVisible) {
      invitePopup = {
        title: 'Invite',
        hideTitle: true,
        content: <InvitePopup onClose={hideInvitePopup} />,
        keys: {
          Enter: hideInvitePopup,
          Escape: hideInvitePopup,
        },
      };
    }

    const canArchive = Boolean(
      retroDispatch &&
        retro &&
        retro.items.length > 0 &&
        canFacilitate &&
        !group,
    );

    const links = [
      { label: 'Invite', action: showInvitePopup },
      retroDispatch
        ? { label: 'Settings', action: `/retros/${retro.slug}/settings` }
        : null,
      canArchive ? { label: 'Create Archive', action: showArchivePopup } : null,
      { label: 'Archives', action: `/retros/${retro.slug}/archives` },
    ];

    return (
      <article className="page-retro">
        <Header
          documentTitle={`${retro.name} - Refacto`}
          title={retro.name}
          backLink={
            group
              ? { label: 'Main Retro', action: `/retros/${retro.slug}` }
              : null
          }
          links={retro ? links : []}
        />
        <RetroFormatPicker
          retroFormat={retro.format}
          retroOptions={retro.options}
          retroItems={retro.items}
          retroState={getState(retro, group)}
          group={group}
          dispatch={retroDispatch ?? undefined}
          onComplete={canArchive ? showArchivePopup : undefined}
          archive={false}
        />
        <Popup data={archivePopup} onClose={hideArchivePopup} />
        <Popup data={invitePopup} onClose={hideInvitePopup} />
      </article>
    );
  },
);
