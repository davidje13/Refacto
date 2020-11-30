import React, { useState, useCallback, memo } from 'react';
import type { RetroItem, UserProvidedRetroItemDetails } from 'refacto-entities';
import ExpandingTextEntry from '../../common/ExpandingTextEntry';
import WrappedButton from '../../common/WrappedButton';
import Attachment from '../../attachments/Attachment';
import GiphyButton from '../../attachments/giphy/GiphyButton';
import useConfig from '../../../hooks/data/useConfig';
import { ReactComponent as Cross } from '../../../../resources/cross.svgr';
import { ReactComponent as Delete } from '../../../../resources/delete.svgr';

interface PropsT {
  defaultItem?: RetroItem;
  onSubmit: (itemParts: Partial<UserProvidedRetroItemDetails>) => void;
  onCancel?: () => void;
  onDelete?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  submitButtonLabel?: React.ReactNode;
  submitButtonTitle?: string;
  allowAttachments?: boolean;
  clearAfterSubmit?: boolean;
  blurOnSubmit?: boolean;
  blurOnCancel?: boolean;
}

export default memo(({
  defaultItem,
  onSubmit,
  onCancel,
  onDelete,
  allowAttachments = false,
  clearAfterSubmit = false,
  ...rest
}: PropsT) => {
  const config = useConfig();

  const [attachment, setAttachment] = useState(defaultItem?.attachment ?? null);
  const handleSubmit = useCallback((message: string) => {
    onSubmit({
      message,
      attachment,
    });
    if (clearAfterSubmit) {
      setAttachment(null);
    }
  }, [onSubmit, attachment, clearAfterSubmit, setAttachment]);

  const attachmentElement = Attachment({ attachment });

  return (
    <ExpandingTextEntry
      defaultValue={defaultItem?.message ?? ''}
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
          <WrappedButton
            key="delete"
            title="Delete"
            className="delete"
            onClick={onDelete}
          >
            <Delete /> Delete
          </WrappedButton>
        ) : null,
      ]}
      postSubmitOptions={[
        onCancel ? (
          <WrappedButton
            key="cancel"
            title="Cancel"
            className="cancel"
            onClick={onCancel}
          >
            <Cross />
          </WrappedButton>
        ) : null,
      ]}
      forceMultiline={Boolean(onCancel || onDelete)}
      clearAfterSubmit={clearAfterSubmit}
      {...rest}
    />
  );
});
