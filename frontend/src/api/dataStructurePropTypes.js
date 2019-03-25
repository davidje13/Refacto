import PropTypes from 'prop-types';
import nullable from 'prop-types-nullable';
import forbidExtraProps from '../helpers/forbidExtraProps';

const exactShape = (props) => PropTypes.shape(forbidExtraProps(props));

export const propTypesShapeRetroSummary = exactShape({
  id: PropTypes.string.isRequired,
  slug: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
});

export const propTypesShapeArchiveSummary = exactShape({
  id: PropTypes.string.isRequired,
  created: PropTypes.number.isRequired,
});

export const propTypesShapeItem = exactShape({
  id: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
  created: PropTypes.number.isRequired,
  message: PropTypes.string.isRequired,
  votes: PropTypes.number,
  done: PropTypes.bool,
});

export const propTypesShapeRetroData = exactShape({
  format: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(propTypesShapeItem).isRequired,
});

export const propTypesShapeArchive = exactShape({
  id: PropTypes.string.isRequired,
  created: PropTypes.number.isRequired,
  data: propTypesShapeRetroData.isRequired,
});

export const propTypesShapeRetro = exactShape({
  id: PropTypes.string.isRequired,
  slug: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  state: PropTypes.shape({}).isRequired,
  data: propTypesShapeRetroData.isRequired,
  archives: PropTypes.arrayOf(propTypesShapeArchiveSummary).isRequired,
});

export const propTypesShapeLoadedRetroList = exactShape({
  retros: PropTypes.arrayOf(propTypesShapeRetroSummary).isRequired,
  error: nullable(PropTypes.string).isRequired,
});
