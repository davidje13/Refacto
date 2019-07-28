import React from 'react';
import PropTypes from 'prop-types';
import RetroLink from './RetroLink';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import { propTypesShapeRetroSummary } from '../../api/dataStructurePropTypes';
import RetroSummary from '../../data/RetroSummary';

interface PropsT {
  retros: RetroSummary[];
}

const RetroList = ({ retros }: PropsT): React.ReactElement => {
  if (!retros.length) {
    return (
      <p>You do not have any retros yet!</p>
    );
  }

  return (
    <ul className="retros">
      { retros.map(({ id, slug, name }) => (
        <li key={id}>
          <RetroLink name={name} slug={slug} />
        </li>
      )) }
    </ul>
  );
};

RetroList.propTypes = {
  retros: PropTypes.arrayOf(propTypesShapeRetroSummary).isRequired,
};

forbidExtraProps(RetroList);

export default React.memo(RetroList);
