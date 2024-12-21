import { useState, memo } from 'react';
import useAwaited from 'react-hook-awaited';
import { type RetroItemAttachment } from '../../../shared/api-entities';
import { giphyService } from '../../../api/api';
import { GiphyAttribution } from './GiphyAttribution';
import './GiphyPopup.css';

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
      (signal) => giphyService.search(appliedQuery, undefined, signal),
      [giphyService, appliedQuery],
    );

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
        {options.latestData?.length ? (
          <section className="choices">
            {options.latestData.map(({ small, medium, alt }) => (
              <button
                key={medium}
                type="button"
                onClick={() => onConfirm({ type: 'giphy', url: medium, alt })}
              >
                <img
                  src={small}
                  alt={`${alt ?? 'no description available'} - click to use this image`}
                  title={alt}
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                />
              </button>
            ))}
          </section>
        ) : null}
        <section className="dialog-options">
          {defaultAttachment ? (
            <button
              type="button"
              className="global-button"
              onClick={() => onConfirm(null)}
            >
              Remove
            </button>
          ) : null}
          <button type="button" className="global-button" onClick={onCancel}>
            Cancel
          </button>
        </section>
        <a
          href="https://giphy.com/"
          className="credit"
          target="_blank"
          rel="noreferrer noopener"
        >
          <GiphyAttribution />
        </a>
      </div>
    );
  },
);
