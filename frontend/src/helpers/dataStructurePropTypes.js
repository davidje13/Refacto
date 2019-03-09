import PropTypes from 'prop-types';

export const propTypesShapeRetroSummary = PropTypes.shape({
  id: PropTypes.string.isRequired,
  slug: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
});

export const propTypesShapeArchiveSummary = PropTypes.shape({
  id: PropTypes.string.isRequired,
  created: PropTypes.number.isRequired,
});

export const propTypesShapeItem = PropTypes.shape({
  id: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
  created: PropTypes.number.isRequired,
  message: PropTypes.string.isRequired,
  votes: PropTypes.number,
  done: PropTypes.bool,
});

export const propTypesShapeRetroData = PropTypes.shape({
  format: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(propTypesShapeItem).isRequired,
});

export const propTypesShapeArchive = PropTypes.shape({
  id: PropTypes.string.isRequired,
  created: PropTypes.number.isRequired,
  data: propTypesShapeRetroData.isRequired,
});

export const propTypesShapeRetro = PropTypes.shape({
  id: PropTypes.string.isRequired,
  slug: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  state: PropTypes.shape({}).isRequired,
  data: propTypesShapeRetroData.isRequired,
  archives: PropTypes.arrayOf(propTypesShapeArchiveSummary).isRequired,
});
