import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { RetroItem, UserProvidedRetroItemDetails } from 'refacto-entities';
import ExpandingTextEntry from '../../common/ExpandingTextEntry';
import WrappedButton from '../../common/WrappedButton';
import Attachment from '../../attachments/Attachment';
import GiphyButton from '../../attachments/giphy/GiphyButton';
import forbidExtraProps from '../../../helpers/forbidExtraProps';
import useConfig from '../../../hooks/data/useConfig';
import { propTypesShapeItem } from '../../../api/dataStructurePropTypes';

interface PropsT {
  defaultItem?: RetroItem;
  onSubmit: (itemParts: Partial<UserProvidedRetroItemDetails>) => void;
  onCancel?: () => void;
  onDelete?: () => void;
  placeholder: string;
  autoFocus: boolean;
  submitButtonLabel?: React.ReactNode;
  submitButtonTitle?: string;
  allowAttachments: boolean;
  clearAfterSubmit: boolean;
}

const ItemEditor = ({
  defaultItem,
  onSubmit,
  onCancel,
  onDelete,
  allowAttachments,
  clearAfterSubmit,
  ...rest
}: PropsT): React.ReactElement => {
  const config = useConfig();

  const [attachment, setAttachment] = useState(defaultItem ? defaultItem.attachment : null);
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
      defaultValue={defaultItem ? defaultItem.message : ''}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      extraInputs={attachmentElement}
      extraOptions={[
        onCancel ? (
          <WrappedButton
            key="cancel"
            title="Cancel"
            className="cancel"
            onClick={onCancel}
          >
            Cancel
          </WrappedButton>
        ) : null,

        onDelete ? (
          <WrappedButton
            key="delete"
            title="Delete"
            className="delete"
            onClick={onDelete}
          >
            Delete
          </WrappedButton>
        ) : null,

        allowAttachments && config && config.giphy ? (
          <GiphyButton
            key="giphy"
            defaultAttachment={attachment}
            onChange={setAttachment}
          />
        ) : null,
      ]}
      forceMultiline={Boolean(onCancel || onDelete)}
      clearAfterSubmit={clearAfterSubmit}
      {...rest}
    />
  );
};

ItemEditor.propTypes = {
  defaultItem: propTypesShapeItem,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  onDelete: PropTypes.func,
  placeholder: PropTypes.string,
  autoFocus: PropTypes.bool,
  submitButtonLabel: PropTypes.node,
  submitButtonTitle: PropTypes.string,
  allowAttachments: PropTypes.bool,
  clearAfterSubmit: PropTypes.bool,
};

ItemEditor.defaultProps = {
  defaultItem: undefined,
  onCancel: null,
  onDelete: null,
  placeholder: '',
  autoFocus: false,
  submitButtonLabel: null,
  submitButtonTitle: null,
  allowAttachments: false,
  clearAfterSubmit: false,
};

forbidExtraProps(ItemEditor);

export default React.memo(ItemEditor);
