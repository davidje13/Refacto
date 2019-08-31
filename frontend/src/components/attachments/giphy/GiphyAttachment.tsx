import React from 'react';
import { RetroItemAttachment } from 'refacto-entities';
import { propTypesShapeItemAttachment } from '../../../api/dataStructurePropTypes';
import forbidExtraProps from '../../../helpers/forbidExtraProps';

interface PropsT {
  attachment: RetroItemAttachment;
}

const GiphyAttachment = ({ attachment: { url } }: PropsT): React.ReactElement => (
  <figure>
    <img src={url} alt="Attachment" crossOrigin="anonymous" />
    <figcaption>Powered By GIPHY</figcaption>
  </figure>
);

GiphyAttachment.propTypes = {
  attachment: propTypesShapeItemAttachment.isRequired,
};

forbidExtraProps(GiphyAttachment);

export default React.memo(GiphyAttachment);
