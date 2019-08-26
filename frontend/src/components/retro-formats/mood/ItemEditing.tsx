import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ExpandingTextEntry from '../../common/ExpandingTextEntry';
import WrappedButton from '../../common/WrappedButton';
import forbidExtraProps from '../../../helpers/forbidExtraProps';

interface PropsT {
  message: string;
  onSubmit: (message: string) => void;
  onCancel?: () => void;
  onDelete?: () => void;
  className?: string;
}

/* eslint-disable jsx-a11y/no-autofocus */ // user triggered this
const ItemEditing = ({
  message,
  onSubmit,
  onCancel,
  onDelete,
  className,
}: PropsT): React.ReactElement => (
  <div className={classNames(className, 'editing')}>
    <ExpandingTextEntry
      defaultValue={message}
      submitButtonLabel="Save"
      submitButtonTitle="Save changes"
      onSubmit={onSubmit}
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
      autoFocus
    />
  </div>
);
/* eslint-enable jsx-a11y/no-autofocus */

ItemEditing.propTypes = {
  message: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  onDelete: PropTypes.func,
  className: PropTypes.string,
};

ItemEditing.defaultProps = {
  onCancel: null,
  onDelete: null,
  className: null,
};

forbidExtraProps(ItemEditing);

export default React.memo(ItemEditing);
