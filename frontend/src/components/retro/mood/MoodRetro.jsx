import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import MoodSection from './categories/MoodSection';
import ActionsPane from './actions/ActionsPane';
import TabControl from '../../common/TabControl';
import forbidExtraProps from '../../../helpers/forbidExtraProps';
import { propTypesShapeRetro } from '../../../helpers/dataStructurePropTypes';
import LocalDateProvider from '../../../time/LocalDateProvider';
import './MoodRetro.css';

const CATEGORIES = ['happy', 'meh', 'sad'];

export const MoodRetro = ({
  retro: {
    state: {
      focusedItemUUID = null,
    },
    items,
  },
  singleColumn,
  localDateProvider,
}) => {
  if (singleColumn) {
    const tabs = [
      ...CATEGORIES.map((category) => ({
        key: category,
        title: category,
        className: category,
        content: (
          <MoodSection
            key={category}
            items={items}
            focusedItemUUID={focusedItemUUID}
            category={category}
          />
        ),
      })),
      {
        key: 'actions',
        title: 'Actions',
        className: 'actions',
        content: (
          <ActionsPane items={items} localDateProvider={localDateProvider} />
        ),
      },
    ];

    return (
      <div className="retro-format-mood single-column">
        <TabControl tabs={tabs} />
      </div>
    );
  }

  return (
    <div className="retro-format-mood multi-column">
      <section className="columns">
        { CATEGORIES.map((category) => (
          <MoodSection
            key={category}
            items={items}
            focusedItemUUID={focusedItemUUID}
            category={category}
          />
        )) }
      </section>
      <ActionsPane items={items} localDateProvider={localDateProvider} />
    </div>
  );
};

MoodRetro.propTypes = {
  retro: propTypesShapeRetro.isRequired,
  singleColumn: PropTypes.bool.isRequired,
  localDateProvider: PropTypes.instanceOf(LocalDateProvider).isRequired,
};

forbidExtraProps(MoodRetro);

const mapStateToProps = (state) => ({
  singleColumn: (state.view.windowWidth <= 800),
  localDateProvider: state.time.localDateProvider,
});

const mapDispatchToProps = {
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MoodRetro);
