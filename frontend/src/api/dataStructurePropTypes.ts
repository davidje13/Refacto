import PropTypes, { Requireable } from 'prop-types';
import {
  RetroItem,
  RetroArchiveSummary,
  RetroSummary,
  Retro,
} from 'refacto-entities';
import forbidExtraProps from '../helpers/forbidExtraProps';

const exactShape = <T>(
  props: T,
): Requireable<PropTypes.InferProps<T>> => PropTypes.shape(forbidExtraProps(props));

export const propTypesShapeRetroSummary: Requireable<RetroSummary | null> = exactShape({
  id: PropTypes.string.isRequired,
  slug: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
});

export const propTypesShapeArchiveSummary: Requireable<RetroArchiveSummary | null> = exactShape({
  id: PropTypes.string.isRequired,
  created: PropTypes.number.isRequired,
});

export const propTypesShapeItem: Requireable<RetroItem | null> = exactShape({
  id: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
  created: PropTypes.number.isRequired,
  message: PropTypes.string.isRequired,
  votes: PropTypes.number.isRequired,
  done: PropTypes.bool.isRequired,
});

export const propTypesShapeRetro: Requireable<Retro | null> = exactShape({
  id: PropTypes.string.isRequired,
  slug: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  ownerId: PropTypes.string.isRequired,
  format: PropTypes.string.isRequired,
  state: PropTypes.shape({}).isRequired,
  items: PropTypes.arrayOf(propTypesShapeItem.isRequired).isRequired,
});
