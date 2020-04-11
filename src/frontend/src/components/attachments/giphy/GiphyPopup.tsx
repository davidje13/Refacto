import React, { useState, useCallback } from 'react';
import type { RetroItemAttachment } from 'refacto-entities';
import WrappedButton from '../../common/WrappedButton';
import Input from '../../common/Input';
import useBoundCallback from '../../../hooks/useBoundCallback';
import useNonce from '../../../hooks/useNonce';
import { giphyService } from '../../../api/api';
import type { GifInfo } from '../../../api/GiphyService';
import './GiphyPopup.less';

interface PropsT {
  defaultAttachment?: RetroItemAttachment | null;
  onConfirm: (attachment: RetroItemAttachment | null) => void;
  onCancel: () => void;
}

const GiphyPopup = ({
  defaultAttachment,
  onConfirm,
  onCancel,
}: PropsT): React.ReactElement => {
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<GifInfo[]>([]);

  const handleDelete = useBoundCallback(onConfirm, null);
  const deleteButton = defaultAttachment ? (
    <WrappedButton onClick={handleDelete}>Remove</WrappedButton>
  ) : null;

  const loadNonce = useNonce();
  const loadOptions = useCallback(async (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nonce = loadNonce.next();
    setOptions([]);

    const gifs = await giphyService.search(query);
    if (!loadNonce.check(nonce)) {
      return;
    }

    setOptions(gifs);
  }, [loadNonce, query]);

  const optionElements = options.map(({ small, medium }) => (
    <WrappedButton
      key={medium}
      onClick={(): void => onConfirm({ type: 'giphy', url: medium })}
    >
      <img src={small} alt="Insert" crossOrigin="anonymous" />
    </WrappedButton>
  ));

  return (
    <div className="popup-giphy">
      <form onSubmit={loadOptions}>
        <Input type="text" value={query} placeholder="Enter a search term" onChange={setQuery} />
        <button type="submit">Search</button>
      </form>
      <p className="credit">
        Powered By <a href="https://giphy.com/" target="_blank" rel="noreferrer noopener">GIPHY</a>
      </p>
      <p className="choices">
        { optionElements }
      </p>
      <p className="dialog-options">
        { deleteButton }
        <WrappedButton onClick={onCancel}>Cancel</WrappedButton>
      </p>
    </div>
  );
};

export default React.memo(GiphyPopup);
