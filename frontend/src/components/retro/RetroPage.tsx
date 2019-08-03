import React, { useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import nullable from 'prop-types-nullable';
import ArchivePopup from './ArchivePopup';
import Header from '../common/Header';
import Loader from '../common/Loader';
import Popup from '../common/Popup';
import withRetroTokenForSlug from '../hocs/withRetroTokenForSlug';
import useBoundCallback from '../../hooks/useBoundCallback';
import useRetroReducer from '../../hooks/data/useRetroReducer';
import { clearCovered } from '../../actions/retro';
import { archiveService } from '../../api/api';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import RetroFormatPicker from '../retro-formats/RetroFormatPicker';
import RetroCreatePage from '../retro-create/RetroCreatePage';
import './RetroPage.less';

interface PropsT {
  slug: string;
  retroId: string | null;
  retroToken: string | null;
  retroTokenError?: string | null;
}

const RetroPage = ({
  slug,
  retroId,
  retroToken,
  retroTokenError,
}: PropsT): React.ReactElement => {
  const [
    retro,
    retroDispatch,
    retroError,
  ] = useRetroReducer(retroId, retroToken);
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
      retroId: retroId!,
      data: retro!.data,
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
    retroId,
    retro,
    retroToken,
  ]);

  const retroName = retro ? retro.name : slug; // TODO TypeScript#16

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
    };
  }

  const canArchive = Boolean((
    retroDispatch &&
    retro && // TODO TypeScript#16
    retro.data &&
    retro.data.items.length > 0
  ));

  // TODO TypeScript#16
  return (
    <article className="page-retro">
      <Header
        documentTitle={`${retroName} - Refacto`}
        title={retroName}
        links={[
          canArchive ? {
            label: 'Create Archive',
            action: showArchivePopup,
          } : null,
          { label: 'Archives', action: `/retros/${slug}/archives` },
        ]}
      />
      <Loader<typeof RetroFormatPicker>
        error={retroTokenError || retroError}
        Component={RetroFormatPicker}
        componentProps={retro ? {
          retroData: retro.data,
          retroState: retro.state,
          dispatch: retroDispatch || undefined,
          onComplete: showArchivePopup,
          archive: false,
        } : null}
      />
      <Popup data={popup} onClose={hideArchivePopup} />
    </article>
  );
};

RetroPage.propTypes = {
  slug: PropTypes.string.isRequired,
  retroId: nullable(PropTypes.string).isRequired,
  retroToken: nullable(PropTypes.string).isRequired,
  retroTokenError: PropTypes.string,
};

RetroPage.defaultProps = {
  retroTokenError: null,
};

forbidExtraProps(RetroPage);

export default React.memo(withRetroTokenForSlug(RetroPage));