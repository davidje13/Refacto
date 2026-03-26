import { memo } from 'react';
import type { RetroItemGiphyAttachment } from '../../../shared/api-entities';
import { GiphyAttribution } from './GiphyAttribution';
import './GiphyAttachment.css';

interface PropsT {
  attachment: RetroItemGiphyAttachment;
}

export const GiphyAttachment = memo(({ attachment: { url, alt } }: PropsT) => (
  <figure className="giphy-attachment">
    <img
      src={url}
      alt={alt}
      title={alt}
      crossOrigin="anonymous"
      referrerPolicy="no-referrer"
    />
    <figcaption>
      <GiphyAttribution />
    </figcaption>
  </figure>
));
