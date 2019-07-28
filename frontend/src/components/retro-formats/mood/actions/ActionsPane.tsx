import React from 'react';
import PropTypes from 'prop-types';
import ActionSection from './ActionSection';
import ExpandingTextEntry from '../../../common/ExpandingTextEntry';
import forbidExtraProps from '../../../../helpers/forbidExtraProps';
import { propTypesShapeItem } from '../../../../api/dataStructurePropTypes';
import LocalDateProvider from '../../../../time/LocalDateProvider';
import { formatDate } from '../../../../time/formatters';
import RetroItem from '../../../../data/RetroItem';

interface PropsT {
  items: RetroItem[];
  localDateProvider: LocalDateProvider;
  onAddItem?: (message: string) => void;
  onSetDone?: (id: string, done: boolean) => void;
  onEdit?: (id: string, message: string) => void;
  onDelete?: (id: string) => void;
}

const ActionsPane = ({
  items,
  localDateProvider,
  onAddItem,
  onSetDone,
  onEdit,
  onDelete,
}: PropsT): React.ReactElement => {
  const today = localDateProvider.getMidnightTimestamp();
  const lastWeek = localDateProvider.getMidnightTimestamp(-7);

  return (
    <section className="actions">
      <header>
        <h2>Action items</h2>
        { onAddItem && (
          <ExpandingTextEntry
            onSubmit={onAddItem}
            submitButtonTitle="Add"
            placeholder="Add an action item"
            clearAfterSubmit
          />
        ) }
      </header>
      <ActionSection
        items={items}
        title={`Today (${formatDate(today)})`}
        rangeFrom={today}
        onSetDone={onSetDone}
        onEdit={onEdit}
        onDelete={onDelete}
      />
      <ActionSection
        items={items}
        title="Past Week"
        rangeFrom={lastWeek}
        rangeTo={today}
        onSetDone={onSetDone}
        onEdit={onEdit}
        onDelete={onDelete}
      />
      <ActionSection
        items={items}
        title="Older"
        rangeTo={lastWeek}
        onSetDone={onSetDone}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </section>
  );
};

ActionsPane.propTypes = {
  items: PropTypes.arrayOf(propTypesShapeItem).isRequired,
  localDateProvider: PropTypes.instanceOf(LocalDateProvider).isRequired,
  onAddItem: PropTypes.func,
  onSetDone: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

ActionsPane.defaultProps = {
  onAddItem: null,
  onSetDone: null,
  onEdit: null,
  onDelete: null,
};

forbidExtraProps(ActionsPane);

export default React.memo(ActionsPane);
