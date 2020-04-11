import React from 'react';
import type { RetroItemAttachment } from 'refacto-entities';

interface PropsT {
  attachment: RetroItemAttachment;
}

const GiphyAttachment = ({ attachment: { url } }: PropsT): React.ReactElement => (
  <figure>
    <img src={url} alt="Attachment" crossOrigin="anonymous" />
    <figcaption>Powered By GIPHY</figcaption>
  </figure>
);

export default React.memo(GiphyAttachment);
