import update, { extend } from 'immutability-helper';

function deleteAtIndex(index, original) {
  return update(original, { $splice: [[index, 1]] });
}

function deleteFirst(condition, original) {
  const index = original.findIndex(condition);
  if (index === -1) {
    return original;
  }
  return deleteAtIndex(index, original);
}

function applyAtIndex([index, fn], original) {
  const originalItem = original[index];
  const newItem = fn(originalItem);
  if (newItem === undefined) {
    return update(original, { $splice: [[index, 1]] });
  }
  return update(original, { [index]: { $set: newItem } });
}

function applyToFirst([condition, fn], original) {
  const index = original.findIndex(condition);
  if (index === -1) {
    return original;
  }
  return applyAtIndex([index, fn], original);
}

extend('$deleteAtIndex', deleteAtIndex);
extend('$deleteFirst', deleteFirst);
extend('$applyAtIndex', applyAtIndex);
extend('$applyToFirst', applyToFirst);
