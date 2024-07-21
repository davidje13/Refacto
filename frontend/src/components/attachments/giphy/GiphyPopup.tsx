import { useState, memo, SyntheticEvent } from 'react';
import { type RetroItemAttachment } from '../../../shared/api-entities';
import { WrappedButton } from '../../common/WrappedButton';
import { Input } from '../../common/Input';
import { useNonce } from '../../../hooks/useNonce';
import { giphyService } from '../../../api/api';
import { type GifInfo } from '../../../api/GiphyService';
import './GiphyPopup.less';

interface PropsT {
  defaultAttachment?: RetroItemAttachment | null;
  onConfirm: (attachment: RetroItemAttachment | null) => void;
  onCancel: () => void;
}

export const GiphyPopup = memo(
  ({ defaultAttachment, onConfirm, onCancel }: PropsT) => {
    const [query, setQuery] = useState('');
    const [options, setOptions] = useState<GifInfo[]>([]);

    const deleteButton = defaultAttachment ? (
      <WrappedButton onClick={() => onConfirm(null)}>Remove</WrappedButton>
    ) : null;

    const loadNonce = useNonce();
    const loadOptions = async (e: SyntheticEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const nonce = loadNonce.next();
      setOptions([]);

      const gifs = await giphyService.search(query);
      if (!loadNonce.check(nonce)) {
        return;
      }

      setOptions(gifs);
    };

    const optionElements = options.map(({ small, medium }) => (
      <WrappedButton
        key={medium}
        onClick={() => onConfirm({ type: 'giphy', url: medium })}
      >
        <img
          src={small}
          alt="Insert"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </WrappedButton>
    ));

    return (
      <div className="popup-giphy">
        <form onSubmit={loadOptions}>
          <Input
            type="text"
            value={query}
            placeholder="Enter a search term"
            onChange={setQuery}
          />
          <button type="submit">Search</button>
        </form>
        <p className="credit">
          Powered By{' '}
          <a
            href="https://giphy.com/"
            target="_blank"
            rel="noreferrer noopener"
          >
            GIPHY
          </a>
        </p>
        <p className="choices">{optionElements}</p>
        <p className="dialog-options">
          {deleteButton}
          <WrappedButton onClick={onCancel}>Cancel</WrappedButton>
        </p>
      </div>
    );
  },
);
