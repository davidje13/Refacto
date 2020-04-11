import React, { memo } from 'react';
import type { RetroItemAttachment } from 'refacto-entities';

interface PropsT {
  attachment: RetroItemAttachment;
}

export default memo(({
  attachment: { url },
}: PropsT) => (
  <figure>
    <img src={url} alt="Attachment" crossOrigin="anonymous" />
    <figcaption>Powered By GIPHY</figcaption>
  </figure>
));
