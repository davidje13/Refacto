import React, {
  useState,
  useCallback,
  useRef,
  memo,
} from 'react';
import type { Retro } from 'refacto-entities';
import type { RetroPagePropsT } from '../RetroRouter';
import ArchivePopup from './ArchivePopup';
import Header from '../common/Header';
import Popup from '../common/Popup';
import useBoundCallback from '../../hooks/useBoundCallback';
import useWindowSize from '../../hooks/env/useWindowSize';
import { clearCovered } from '../../actions/retro';
import { archiveService } from '../../api/api';
import OPTIONS from '../../helpers/optionManager';
import RetroFormatPicker from '../retro-formats/RetroFormatPicker';
import './RetroPage.less';
import InvitePopup from './InvitePopup';

const BLANK_STATE = {};

function getState<T>(retro: Retro<T>, group?: string): T {
  if (!group) {
    return retro.state;
  }
  return retro.groupStates[group] || (BLANK_STATE as T);
}

type PropsT = Pick<RetroPagePropsT, 'retroToken' | 'retro' | 'retroDispatch'> & {
  group?: string;
};

export default memo(({
  retroToken,
  retro,
  retroDispatch,
  group,
}: PropsT) => {
  const smallScreen = useWindowSize(({ width }) => (width <= 800), []);
  const [archivePopupVisible, setArchivePopupVisible] = useState(false);
  const showArchivePopup = useBoundCallback(setArchivePopupVisible, true);
  const hideArchivePopup = useBoundCallback(setArchivePopupVisible, false);
  const [invitePopupVisible, setInvitePopupVisible] = useState(false);
  const showInvitePopup = useBoundCallback(setInvitePopupVisible, true);
  const hideInvitePopup = useBoundCallback(setInvitePopupVisible, false);

  const isArchiving = useRef(false);
  const performArchive = useCallback(() => {
    if (isArchiving.current || group) {
      return;
    }
    isArchiving.current = true;

    archiveService.create({ retro, retroToken }).then(() => {
      isArchiving.current = false;
      retroDispatch!(clearCovered());
      hideArchivePopup();
    }).catch((e) => {
      /* eslint-disable-next-line no-console */ // TODO: report failure to user
      console.error('Failed to create archive', e);
    });
  }, [
    isArchiving,
    hideArchivePopup,
    archiveService,
    retroDispatch,
    clearCovered,
    retro,
    retroToken,
    group,
  ]);

  const canFacilitate = (
    !smallScreen ||
    (OPTIONS.enableMobileFacilitation.read(retro.options))
  );

  let archivePopup = null;
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

  let invitePopup = null;
  if (invitePopupVisible) {
    invitePopup = {
      title: 'Invite',
      content: (<InvitePopup onClose={hideInvitePopup} />),
      keys: {
        Enter: hideInvitePopup,
        Escape: hideInvitePopup,
      },
    };
  }

  const canArchive = Boolean((
    retroDispatch &&
    retro &&
    retro.items.length > 0 &&
    canFacilitate &&
    !group
  ));

  const links = [
    { label: 'Invite', action: showInvitePopup },
    retroDispatch ? {
      label: 'Settings',
      action: `/retros/${retro.slug}/settings`,
    } : null,
    canArchive ? {
      label: 'Create Archive',
      action: showArchivePopup,
    } : null,
    { label: 'Archives', action: `/retros/${retro.slug}/archives` },
  ];

  return (
    <article className="page-retro">
      <Header
        documentTitle={`${retro.name} - Refacto`}
        title={retro.name}
        backLink={group ? {
          label: 'Main Retro',
          action: `/retros/${retro.slug}`,
        } : null}
        links={retro ? links : []}
      />
      <RetroFormatPicker
        retroFormat={retro.format}
        retroOptions={retro.options}
        retroItems={retro.items}
        retroState={getState(retro, group)}
        group={group}
        dispatch={retroDispatch || undefined}
        onComplete={canArchive ? showArchivePopup : undefined}
        archive={false}
      />
      <Popup data={archivePopup} onClose={hideArchivePopup} />
      <Popup data={invitePopup} onClose={hideInvitePopup} />
    </article>
  );
});
