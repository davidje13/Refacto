import { useState, memo } from 'react';
import useAwaited from 'react-hook-awaited';
import { type RetroItemAttachment } from '../../../shared/api-entities';
import { giphyService } from '../../../api/api';
import './GiphyPopup.less';

interface PropsT {
  defaultAttachment?: RetroItemAttachment | null;
  onConfirm: (attachment: RetroItemAttachment | null) => void;
  onCancel: () => void;
}

export const GiphyPopup = memo(
  ({ defaultAttachment, onConfirm, onCancel }: PropsT) => {
    const [query, setQuery] = useState('');
    const [appliedQuery, setAppliedQuery] = useState('');
    const options = useAwaited(
      (signal) => giphyService.search(appliedQuery, signal),
      [giphyService, appliedQuery],
    );

    const deleteButton = defaultAttachment ? (
      <button type="button" onClick={() => onConfirm(null)}>
        Remove
      </button>
    ) : null;

    const optionElements = options.latestData?.map(({ small, medium }) => (
      <button
        key={medium}
        type="button"
        onClick={() => onConfirm({ type: 'giphy', url: medium })}
      >
        <img
          src={small}
          alt="Insert"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </button>
    ));

    return (
      <div className="popup-giphy">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setAppliedQuery(query);
          }}
        >
          <input
            type="text"
            value={query}
            placeholder="Enter a search term"
            onChange={(e) => setQuery(e.currentTarget.value)}
            autoComplete="off"
          />
          <button type="submit" className="global-button primary">
            Search
          </button>
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
          <button type="button" className="global-button" onClick={onCancel}>
            Cancel
          </button>
        </p>
      </div>
    );
  },
);
