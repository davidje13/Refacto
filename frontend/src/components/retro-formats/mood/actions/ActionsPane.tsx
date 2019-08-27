import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { RetroItem, UserProvidedRetroItemDetails } from 'refacto-entities';
import ActionSection from './ActionSection';
import ItemEditor from '../ItemEditor';
import forbidExtraProps from '../../../../helpers/forbidExtraProps';
import { propTypesShapeItem } from '../../../../api/dataStructurePropTypes';
import LocalDateProvider from '../../../../time/LocalDateProvider';
import { formatDate } from '../../../../time/formatters';

interface PropsT {
  items: RetroItem[];
  localDateProvider: LocalDateProvider;
  alwaysShowEntry: boolean;
  onAddItem?: (itemParts: Partial<UserProvidedRetroItemDetails>) => void;
  onSetDone?: (id: string, done: boolean) => void;
  onEdit?: (id: string, diff: Partial<UserProvidedRetroItemDetails>) => void;
  onDelete?: (id: string) => void;
}

const ActionsPane = ({
  items,
  localDateProvider,
  alwaysShowEntry,
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
          <div
            className={classNames('new-action-item-hold', {
              'always-visible': alwaysShowEntry,
            })}
          >
            <div className="new-action-item">
              <ItemEditor
                onSubmit={onAddItem}
                submitButtonTitle="Add"
                placeholder="Add an action item"
                clearAfterSubmit
              />
            </div>
          </div>
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
  alwaysShowEntry: PropTypes.bool,
  onAddItem: PropTypes.func,
  onSetDone: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

ActionsPane.defaultProps = {
  alwaysShowEntry: false,
  onAddItem: null,
  onSetDone: null,
  onEdit: null,
  onDelete: null,
};

forbidExtraProps(ActionsPane);

export default React.memo(ActionsPane);
