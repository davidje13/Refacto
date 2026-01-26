import { memo, type ReactNode } from 'react';
import type {
  RetroItem,
  UserProvidedRetroItemDetails,
} from '../../../shared/api-entities';
import { useEvent } from '../../../hooks/useEvent';
import { ExpandingTextEntry } from '../../common/ExpandingTextEntry';
import { Attachment } from '../../attachments/Attachment';
import { GiphyButton } from '../../attachments/giphy/GiphyButton';
import { useConfig } from '../../../hooks/data/useConfig';
import { useStateMap } from '../../../hooks/useStateMap';
import Cross from '../../../../resources/cross.svg';
import Delete from '../../../../resources/delete.svg';

interface PropsT {
  defaultItem?: RetroItem;
  identifier?: string | undefined;
  onSubmit: (itemParts: Partial<UserProvidedRetroItemDetails>) => void;
  onCancel?: (() => void) | undefined;
  onDelete?: (() => void) | undefined;
  onChange?: ((value: string) => void) | undefined;
  placeholder?: string;
  autoFocus?: boolean;
  submitButtonLabel?: ReactNode;
  submitButtonTitle?: string;
  allowAttachments?: boolean;
  clearAfterSubmit?: boolean;
  blurOnSubmit?: boolean;
  blurOnCancel?: boolean;
}

export const ItemEditor = memo(
  ({
    defaultItem,
    identifier,
    onSubmit,
    onCancel,
    onDelete,
    onChange,
    allowAttachments = false,
    clearAfterSubmit = false,
    ...rest
  }: PropsT) => {
    const config = useConfig();

    const [attachment, setAttachment] = useStateMap(
      identifier,
      'attachment',
      defaultItem?.attachment ?? null,
    );
    const handleSubmit = useEvent((message: string) => {
      onSubmit({ message, attachment });
      if (clearAfterSubmit) {
        setAttachment(null);
      }
    });

    const attachmentElement = Attachment({ attachment });

    return (
      <ExpandingTextEntry
        defaultValue={defaultItem?.message ?? ''}
        identifier={identifier}
        onChange={onChange}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        extraInputs={attachmentElement}
        preSubmitOptions={[
          allowAttachments && config?.giphy ? (
            <div className="attachments" key="attachments">
              <div className="label">Extras:</div>
              <GiphyButton
                key="giphy"
                defaultAttachment={attachment}
                onChange={setAttachment}
              />
            </div>
          ) : null,

          onDelete ? (
            <button
              key="delete"
              type="button"
              title="Delete"
              className="delete"
              onClick={onDelete}
            >
              <Delete role="presentation" /> Delete
            </button>
          ) : null,
        ]}
        postSubmitOptions={[
          onCancel ? (
            <button
              key="cancel"
              type="button"
              title="Cancel"
              className="cancel"
              onClick={onCancel}
            >
              <Cross aria-label="Cancel" role="img" />
            </button>
          ) : null,
        ]}
        forceMultiline={Boolean(onCancel || onDelete)}
        clearAfterSubmit={clearAfterSubmit}
        {...rest}
      />
    );
  },
);
