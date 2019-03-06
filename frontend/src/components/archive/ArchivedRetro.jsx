import React from 'react';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import RetroFormatPicker from '../retro-formats/RetroFormatPicker';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import { propTypesShapeArchive } from '../../helpers/dataStructurePropTypes';

export const ArchivedRetro = ({ archive }) => {
  const { retro, data } = archive;

  return (
    <React.Fragment>
      <Helmet title={`${retro.name} [Archive] - Refacto`} />
      <header>
        <h1 className="retro-name">{retro.name} Archive</h1>
      </header>
      <RetroFormatPicker retroData={data} retroState={{}} archive />
    </React.Fragment>
  );
};

ArchivedRetro.propTypes = {
  archive: propTypesShapeArchive.isRequired,
};

forbidExtraProps(ArchivedRetro);

const mapStateToProps = (state) => ({
  archive: state.currentArchive.archive,
});

const mapDispatchToProps = {
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ArchivedRetro);
