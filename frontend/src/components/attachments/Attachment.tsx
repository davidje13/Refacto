import type { FC, ComponentType } from 'react';
import type { RetroItemAttachment } from '../../shared/api-entities';
import { GiphyAttachment } from './giphy/GiphyAttachment';

interface ChildPropsT {
  attachment: RetroItemAttachment;
}

interface PropsT {
  attachment: RetroItemAttachment | null;
}

const TYPES = new Map<string, ComponentType<ChildPropsT>>();
TYPES.set('giphy', GiphyAttachment);

export const Attachment: FC<PropsT> = ({ attachment }) => {
  if (attachment) {
    const Type = TYPES.get(attachment.type);
    if (Type) {
      return <Type attachment={attachment} />;
    }
  }
  return null;
};
