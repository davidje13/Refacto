import React, {
  useState,
  useCallback,
  useRef,
  memo,
} from 'react';
import ArchivePopup from './ArchivePopup';
import Header from '../common/Header';
import Loader from '../common/Loader';
import Popup from '../common/Popup';
import withRetroTokenForSlug from '../hocs/withRetroTokenForSlug';
import useBoundCallback from '../../hooks/useBoundCallback';
import useRetroReducer from '../../hooks/data/useRetroReducer';
import useWindowSize from '../../hooks/env/useWindowSize';
import { clearCovered } from '../../actions/retro';
import { archiveService } from '../../api/api';
import OPTIONS from '../../helpers/optionManager';
import RetroFormatPicker from '../retro-formats/RetroFormatPicker';
import RetroCreatePage from '../retro-create/RetroCreatePage';
import './RetroPage.less';

interface PropsT {
  slug: string;
  retroId: string | null;
  retroToken: string | null;
  retroTokenError?: string | null;
}

export default memo(withRetroTokenForSlug(({
  slug,
  retroId,
  retroToken,
  retroTokenError,
}: PropsT) => {
  const [
    retro,
    retroDispatch,
    retroError,
  ] = useRetroReducer(retroId, retroToken);
  const smallScreen = useWindowSize(({ width }) => (width <= 800), []);
  const [archivePopupVisible, setArchivePopupVisible] = useState(false);
  const showArchivePopup = useBoundCallback(setArchivePopupVisible, true);
  const hideArchivePopup = useBoundCallback(setArchivePopupVisible, false);

  const isArchiving = useRef(false);
  const performArchive = useCallback(() => {
    if (isArchiving.current) {
      return;
    }
    isArchiving.current = true;

    archiveService.create({
      retro: retro!,
      retroToken: retroToken!,
    }).then(() => {
      isArchiving.current = false;
      retroDispatch!(clearCovered());
      hideArchivePopup();
    });
  }, [
    isArchiving,
    hideArchivePopup,
    archiveService,
    retroDispatch,
    clearCovered,
    retro,
    retroToken,
  ]);

  const canFacilitate = (
    !smallScreen ||
    (retro && OPTIONS.enableMobileFacilitation.read(retro.options))
  );

  const retroName = retro?.name ?? slug;

  if (retroTokenError === 'not found') {
    return (<RetroCreatePage defaultSlug={slug} />);
  }

  let popup = null;
  if (retroDispatch && archivePopupVisible) {
    popup = {
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

  const canArchive = Boolean((
    retroDispatch &&
    retro &&
    retro.items.length > 0 &&
    canFacilitate
  ));

  const links = [
    retroDispatch ? {
      label: 'Settings',
      action: `/retros/${slug}/settings`,
    } : null,
    canArchive ? {
      label: 'Create Archive',
      action: showArchivePopup,
    } : null,
    { label: 'Archives', action: `/retros/${slug}/archives` },
  ];

  return (
    <article className="page-retro">
      <Header
        documentTitle={`${retroName} - Refacto`}
        title={retroName}
        links={retro ? links : []}
      />
      <Loader<typeof RetroFormatPicker>
        error={retroTokenError || retroError}
        Component={RetroFormatPicker}
        componentProps={retro ? {
          retroFormat: retro.format,
          retroOptions: retro.options,
          retroItems: retro.items,
          retroState: retro.state,
          dispatch: retroDispatch || undefined,
          onComplete: canArchive ? showArchivePopup : undefined,
          archive: false,
        } : null}
      />
      <Popup data={popup} onClose={hideArchivePopup} />
    </article>
  );
}));
