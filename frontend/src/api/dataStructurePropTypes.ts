import PropTypes from 'prop-types';
import forbidExtraProps from '../helpers/forbidExtraProps';

const exactShape = <T>(
  props: T,
): PropTypes.Requireable<PropTypes.InferProps<T>> => PropTypes.shape(forbidExtraProps(props));

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
