import React from 'react';
import { Link } from 'react-router-dom';
import Helmet from 'react-helmet-async';
import RetroFormatPicker from '../retro-formats/RetroFormatPicker';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import {
  propTypesShapeRetro,
  propTypesShapeArchive,
} from '../../helpers/dataStructurePropTypes';

export const ArchivedRetro = ({ retro, archive }) => (
  <React.Fragment>
    <Helmet title={`${retro.name} [Archive] - Refacto`} />
    <header>
      <h1 className="retro-name">{retro.name} Archive</h1>
      <Link className="back" to={`/retros/${retro.slug}/archives`}>Archives</Link>
    </header>
    <RetroFormatPicker retroData={archive.data} retroState={{}} archive />
  </React.Fragment>
);

ArchivedRetro.propTypes = {
  retro: propTypesShapeRetro.isRequired,
  archive: propTypesShapeArchive.isRequired,
};

forbidExtraProps(ArchivedRetro);

export default ArchivedRetro;
