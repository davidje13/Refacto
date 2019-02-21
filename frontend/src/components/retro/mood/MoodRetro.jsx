import React from 'react';
import MoodSection from './MoodSection';
import ActionSection from './ActionSection';
import forbidExtraProps from '../../../helpers/forbidExtraProps';
import { propTypesShapeRetro } from '../../../helpers/dataStructurePropTypes';
import './style.css';

const MoodRetro = ({
  retro: {
    state: {
      focusedItemUUID = null,
    },
    items,
  },
}) => (
  <div className="retro-format-mood">
    <section className="columns">
      <MoodSection items={items} focusedItemUUID={focusedItemUUID} category="happy" />
      <MoodSection items={items} focusedItemUUID={focusedItemUUID} category="meh" />
      <MoodSection items={items} focusedItemUUID={focusedItemUUID} category="sad" />
    </section>
    <section className="actions">
      <h2>Actions</h2>
      <ActionSection items={items} title="Today" />
      <ActionSection items={items} title="Past Week" />
      <ActionSection items={items} title="Older" />
    </section>
  </div>
);

MoodRetro.propTypes = {
  retro: propTypesShapeRetro.isRequired,
};

forbidExtraProps(MoodRetro);

export default MoodRetro;
