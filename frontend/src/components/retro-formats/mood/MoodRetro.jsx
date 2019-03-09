import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames';
import MoodSection from './categories/MoodSection';
import ActionsPane from './actions/ActionsPane';
import TabControl from '../../common/TabControl';
import nullable from '../../../helpers/nullableProps';
import forbidExtraProps from '../../../helpers/forbidExtraProps';
import { propTypesShapeRetroData } from '../../../helpers/dataStructurePropTypes';
import LocalDateProvider from '../../../time/LocalDateProvider';
import './MoodRetro.less';

const CATEGORIES = [
  { id: 'happy', title: 'Happy', placeholder: 'I\u2019m glad that\u2026' },
  { id: 'meh', title: 'Meh', placeholder: 'I\u2019m wondering about\u2026' },
  { id: 'sad', title: 'Sad', placeholder: 'It wasn\u2019t so great that\u2026' },
];

export class MoodRetro extends React.PureComponent {
  static propTypes = {
    retroState: PropTypes.shape({
      focusedItemId: PropTypes.string,
      focusedItemTimeout: PropTypes.number,
    }).isRequired,
    retroData: propTypesShapeRetroData.isRequired,
    singleColumn: PropTypes.bool.isRequired,
    localDateProvider: PropTypes.instanceOf(LocalDateProvider).isRequired,
    archive: PropTypes.bool.isRequired,
    onAddItem: nullable(PropTypes.func).isRequired,
    onVoteItem: nullable(PropTypes.func).isRequired,
    onEditItem: nullable(PropTypes.func).isRequired,
    onDeleteItem: nullable(PropTypes.func).isRequired,
    onSetItemDone: nullable(PropTypes.func).isRequired,
    onSetRetroState: nullable(PropTypes.func).isRequired,
  };

  onAddActionItem = (message) => {
    const { onAddItem } = this.props;
    onAddItem('action', message);
  };

  onSwitchFocus = (id) => {
    const { onSetRetroState } = this.props;
    onSetRetroState({
      focusedItemId: id,
      focusedItemTimeout: Date.now() + (5 * 60 * 1000 + 999),
    });
  };

  onAddExtraTime = (duration) => {
    const { onSetRetroState } = this.props;
    onSetRetroState({
      focusedItemTimeout: Date.now() + duration,
    });
  };

  createMoodSection = (category) => {
    const {
      retroState: {
        focusedItemId = null,
        focusedItemTimeout = 0,
      },
      retroData: {
        items,
      },
      onAddItem,
      onVoteItem,
      onEditItem,
      onDeleteItem,
      onSetItemDone,
      onSetRetroState,
    } = this.props;

    return (
      <MoodSection
        key={category.id}
        items={items}
        addItemPlaceholder={category.placeholder}
        onAddItem={onAddItem}
        onVote={onVoteItem}
        onEdit={onEditItem}
        onDelete={onDeleteItem}
        onSwitchFocus={onSetRetroState === null ? null : this.onSwitchFocus}
        onAddExtraTime={onSetRetroState === null ? null : this.onAddExtraTime}
        onSetDone={onSetItemDone}
        focusedItemId={focusedItemId}
        focusedItemTimeout={focusedItemTimeout}
        category={category.id}
      />
    );
  };

  createActionSection = () => {
    const {
      retroData: {
        items,
      },
      onAddItem,
      localDateProvider,
      onEditItem,
      onDeleteItem,
      onSetItemDone,
    } = this.props;

    return (
      <ActionsPane
        items={items}
        onAddItem={onAddItem === null ? null : this.onAddActionItem}
        onSetDone={onSetItemDone}
        onEdit={onEditItem}
        onDelete={onDeleteItem}
        localDateProvider={localDateProvider}
      />
    );
  };

  render() {
    const {
      retroState: {
        focusedItemId = null,
      },
      singleColumn,
      archive,
    } = this.props;

    const hasFocused = (focusedItemId !== null);

    const baseClassName = classNames(
      'retro-format-mood',
      singleColumn ? 'single-column' : 'multi-column',
      { 'has-focused': hasFocused, archive },
    );

    if (singleColumn) {
      const tabs = [
        ...CATEGORIES.map((category) => ({
          key: category.id,
          title: category.title,
          className: category.id,
          content: this.createMoodSection(category),
        })),
        {
          key: 'actions',
          title: 'Action',
          className: 'actions',
          content: this.createActionSection(),
        },
      ];

      return (
        <div className={baseClassName}>
          <TabControl tabs={tabs} />
        </div>
      );
    }

    return (
      <div className={baseClassName}>
        <section className="columns">
          { CATEGORIES.map((category) => this.createMoodSection(category)) }
        </section>
        { this.createActionSection() }
      </div>
    );
  }
}

forbidExtraProps(MoodRetro);

const mapStateToProps = (state) => ({
  singleColumn: (state.view.windowWidth <= 800),
  localDateProvider: state.time.localDateProvider,
});

export default connect(mapStateToProps, () => ({}))(MoodRetro);
