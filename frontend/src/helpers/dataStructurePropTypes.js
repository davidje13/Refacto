import PropTypes from 'prop-types';

export const propTypesShapeItem = PropTypes.shape({
  uuid: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
  created: PropTypes.number.isRequired,
  message: PropTypes.string.isRequired,
  votes: PropTypes.number,
  done: PropTypes.bool,
});

export const propTypesShapeRetro = PropTypes.shape({
  slug: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  format: PropTypes.string.isRequired,
  state: PropTypes.shape({}).isRequired,
  items: PropTypes.arrayOf(propTypesShapeItem).isRequired,
});

export const propTypesShapeRetroSummary = PropTypes.shape({
  slug: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
});
