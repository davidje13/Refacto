import { memo } from 'react';
import { type RetroItemAttachment } from '../../../shared/api-entities';

interface PropsT {
  attachment: RetroItemAttachment;
}

export const GiphyAttachment = memo(({ attachment: { url, alt } }: PropsT) => (
  <figure>
    <img
      src={url}
      alt={alt}
      title={alt}
      crossOrigin="anonymous"
      referrerPolicy="no-referrer"
    />
    <figcaption>Powered By GIPHY</figcaption>
  </figure>
));
