import React from 'react';
import PropTypes from 'prop-types';
import RetroLink from './RetroLink';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import { propTypesShapeRetroSummary } from '../../helpers/dataStructurePropTypes';

export const RetroList = ({ retros }) => {
  if (!retros.length) {
    return (
      <p>You do not have any retros yet!</p>
    );
  }

  return (
    <React.Fragment>
      <h1>Retros</h1>
      <ul className="retros">
        { retros.map(({ id, slug, name }) => (
          <li key={id}>
            <RetroLink name={name} slug={slug} />
          </li>
        )) }
      </ul>
    </React.Fragment>
  );
};

RetroList.propTypes = {
  retros: PropTypes.arrayOf(propTypesShapeRetroSummary).isRequired,
};

forbidExtraProps(RetroList);

export default RetroList;
