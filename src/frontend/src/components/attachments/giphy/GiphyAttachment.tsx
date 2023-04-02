import React, { memo } from 'react';
import type { RetroItemAttachment } from '../../../shared/api-entities';

interface PropsT {
  attachment: RetroItemAttachment;
}

export default memo(({
  attachment: { url },
}: PropsT) => (
  <figure>
    <img src={url} alt="Attachment" crossOrigin="anonymous" referrerPolicy="no-referrer" />
    <figcaption>Powered By GIPHY</figcaption>
  </figure>
));
