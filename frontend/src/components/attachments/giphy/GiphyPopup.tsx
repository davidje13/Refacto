import { useState, memo } from 'react';
import useAwaited from 'react-hook-awaited';
import { type RetroItemAttachment } from '../../../shared/api-entities';
import { WrappedButton } from '../../common/WrappedButton';
import { Input } from '../../common/Input';
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
      <WrappedButton onClick={() => onConfirm(null)}>Remove</WrappedButton>
    ) : null;

    const optionElements = options.latestData?.map(({ small, medium }) => (
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
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setAppliedQuery(query);
          }}
        >
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
