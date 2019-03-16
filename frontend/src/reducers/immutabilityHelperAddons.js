import update, { extend } from 'immutability-helper';

function find(original, property, value) {
  return original.findIndex((o) => (o[property] === value));
}

function deleteAtIndex(index, original) {
  if (index === -1) {
    return original;
  }
  return update(original, { $splice: [[index, 1]] });
}

function deleteWhere([property, value], original) {
  const index = find(original, property, value);
  return deleteAtIndex(index, original);
}

function updateAtIndex([index, updater], original) {
  if (index === -1 || !updater) {
    return original;
  }
  const originalItem = original[index];
  const newItem = update(originalItem, updater);
  return update(original, { [index]: { $set: newItem } });
}

function updateWhere([property, value, updater], original) {
  const index = find(original, property, value);
  return updateAtIndex([index, updater], original);
}

function add(value, original) {
  return original + value;
}

extend('$deleteAtIndex', deleteAtIndex);
extend('$deleteWhere', deleteWhere);
extend('$updateAtIndex', updateAtIndex);
extend('$updateWhere', updateWhere);
extend('$add', add);
