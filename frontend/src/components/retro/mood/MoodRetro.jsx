import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import MoodSection from './MoodSection';
import ActionSection from './ActionSection';
import forbidExtraProps from '../../../helpers/forbidExtraProps';
import { propTypesShapeRetro } from '../../../helpers/dataStructurePropTypes';
import LocalDateProvider from '../../../time/LocalDateProvider';
import { formatDate } from '../../../time/formatters';
import './style.css';

export const MoodRetro = ({
  retro: {
    state: {
      focusedItemUUID = null,
    },
    items,
  },
  localDateProvider,
}) => {
  const today = localDateProvider.getMidnightTimestamp();
  const lastWeek = localDateProvider.getMidnightTimestamp(-7);

  return (
    <div className="retro-format-mood">
      <section className="columns">
        <MoodSection items={items} focusedItemUUID={focusedItemUUID} category="happy" />
        <MoodSection items={items} focusedItemUUID={focusedItemUUID} category="meh" />
        <MoodSection items={items} focusedItemUUID={focusedItemUUID} category="sad" />
      </section>
      <section className="actions">
        <h2>Actions</h2>
        <ActionSection
          items={items}
          title={`Today (${formatDate(today)})`}
          rangeFrom={today}
        />
        <ActionSection
          items={items}
          title="Past Week"
          rangeFrom={lastWeek}
          rangeTo={today}
        />
        <ActionSection
          items={items}
          title="Older"
          rangeTo={lastWeek}
        />
      </section>
    </div>
  );
};

MoodRetro.propTypes = {
  retro: propTypesShapeRetro.isRequired,
  localDateProvider: PropTypes.instanceOf(LocalDateProvider).isRequired,
};

forbidExtraProps(MoodRetro);

const mapStateToProps = (state) => ({
  localDateProvider: state.time.localDateProvider,
});

const mapDispatchToProps = {
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MoodRetro);
