import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { RetroItem, UserProvidedRetroItemDetails } from 'refacto-entities';
import ExpandingTextEntry from '../../common/ExpandingTextEntry';
import WrappedButton from '../../common/WrappedButton';
import forbidExtraProps from '../../../helpers/forbidExtraProps';
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
  clearAfterSubmit: boolean;
}

const ItemEditor = ({
  defaultItem,
  onSubmit,
  onCancel,
  onDelete,
  ...rest
}: PropsT): React.ReactElement => {
  const handleSubmit = useCallback((message: string) => {
    onSubmit({
      message,
    });
  }, [onSubmit]);

  return (
    <ExpandingTextEntry
      defaultValue={defaultItem ? defaultItem.message : ''}
      onSubmit={handleSubmit}
      onCancel={onCancel}
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
      ]}
      forceMultiline={Boolean(onCancel || onDelete)}
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
  clearAfterSubmit: false,
};

forbidExtraProps(ItemEditor);

export default React.memo(ItemEditor);
