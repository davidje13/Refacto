import React from 'react';
import type { RetroItemAttachment } from 'refacto-entities';
import GiphyAttachment from './giphy/GiphyAttachment';

interface ChildPropsT {
  attachment: RetroItemAttachment;
}

interface PropsT {
  attachment: RetroItemAttachment | null;
}

const TYPES = new Map<string, React.ComponentType<ChildPropsT>>();
TYPES.set('giphy', GiphyAttachment);

const Attachment = ({ attachment }: PropsT): React.ReactElement | null => {
  if (attachment) {
    const Type = TYPES.get(attachment.type);
    if (Type) {
      return (<Type attachment={attachment} />);
    }
  }
  return null;
};

export default Attachment;
