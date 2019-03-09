import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import Helmet from 'react-helmet-async';
import RetroFormatPicker from '../retro-formats/RetroFormatPicker';
import { propTypesShapeRetro } from '../../helpers/dataStructurePropTypes';
import {
  addItem,
  upvoteItem,
  editItem,
  deleteItem,
  setItemDone,
  setRetroState,
} from '../../reducers/activeRetro';

export const Retro = ({ retro, ...passThrough }) => {
  const { name, state, data } = retro;

  return (
    <React.Fragment>
      <Helmet title={`${name} - Refacto`} />
      <header>
        <h1 className="retro-name">{name}</h1>
        <Link className="archives" to={`/retros/${retro.slug}/archives`}>Archives</Link>
      </header>
      <RetroFormatPicker retroData={data} retroState={state} {...passThrough} />
    </React.Fragment>
  );
};

Retro.propTypes = {
  retro: propTypesShapeRetro.isRequired,
};

const mapStateToProps = (state) => ({
  retro: state.activeRetro.retro,
});

const mapDispatchToProps = {
  onAddItem: addItem,
  onVoteItem: upvoteItem,
  onEditItem: editItem,
  onDeleteItem: deleteItem,
  onSetItemDone: setItemDone,
  onSetRetroState: setRetroState,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Retro);
