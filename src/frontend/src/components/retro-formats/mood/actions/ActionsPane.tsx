import React, { memo } from 'react';
import classNames from 'classnames';
import type {
  RetroItem,
  UserProvidedRetroItemDetails,
} from '../../../../shared/api-entities';
import ActionSection from './ActionSection';
import ItemEditor from '../ItemEditor';
import type LocalDateProvider from '../../../../time/LocalDateProvider';
import { formatDate } from '../../../../time/formatters';
import useBoundCallback from '../../../../hooks/useBoundCallback';
import TickBold from '../../../../../resources/tick-bold.svg';

interface PropsT {
  items: RetroItem[];
  localDateProvider: LocalDateProvider;
  alwaysShowEntry?: boolean;
  group?: string;
  onAddItem?: (
    group: string | undefined,
    itemParts: Partial<UserProvidedRetroItemDetails>,
  ) => void;
  onSetDone?: (id: string, done: boolean) => void;
  onEdit?: (id: string, diff: Partial<UserProvidedRetroItemDetails>) => void;
  onDelete?: (id: string) => void;
}

export default memo(
  ({
    items,
    localDateProvider,
    alwaysShowEntry = false,
    group,
    onAddItem,
    onSetDone,
    onEdit,
    onDelete,
  }: PropsT) => {
    const handleAddItem = useBoundCallback(onAddItem, group);
    const today = localDateProvider.getMidnightTimestamp();
    const lastWeek = localDateProvider.getMidnightTimestamp(-7);

    return (
      <section className="actions">
        <header>
          <h2>Action items</h2>
          {handleAddItem && (
            <div
              className={classNames('new-action-item-hold', {
                'always-visible': alwaysShowEntry,
              })}
            >
              <div className="new-action-item">
                <ItemEditor
                  identifier="new-action"
                  onSubmit={handleAddItem}
                  submitButtonLabel={<TickBold />}
                  submitButtonTitle="Add"
                  placeholder="Add an action item"
                  clearAfterSubmit
                  blurOnSubmit
                  blurOnCancel
                />
              </div>
            </div>
          )}
        </header>
        <ActionSection
          items={items}
          title={`Today (${formatDate(today)})`}
          group={group}
          rangeFrom={today}
          onSetDone={onSetDone}
          onEdit={onEdit}
          onDelete={onDelete}
        />
        <ActionSection
          items={items}
          title="Past Week"
          group={undefined}
          rangeFrom={lastWeek}
          rangeTo={today}
          onSetDone={onSetDone}
          onEdit={onEdit}
          onDelete={onDelete}
        />
        <ActionSection
          items={items}
          title="Older"
          group={undefined}
          rangeTo={lastWeek}
          onSetDone={onSetDone}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </section>
    );
  },
);
