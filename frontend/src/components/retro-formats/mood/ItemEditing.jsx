import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ExpandingTextEntry from '../../common/ExpandingTextEntry';
import WrappedButton from '../../common/WrappedButton';
import forbidExtraProps from '../../../helpers/forbidExtraProps';

const ItemEditing = ({
  message,
  onSubmit,
  onCancel,
  onDelete,
  className,
}) => (
  <div className={classNames(className, 'editing')}>
    <ExpandingTextEntry
      defaultValue={message}
      submitButtonLabel="Save"
      submitButtonTitle="Save changes"
      onSubmit={onSubmit}
      onCancel={onCancel}
      extraOptions={onDelete && (
        <WrappedButton title="Delete" className="delete" onClick={onDelete}>
          Delete
        </WrappedButton>
      )}
      autoFocus /* eslint-disable-line jsx-a11y/no-autofocus */ // user triggered this
    />
  </div>
);

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
