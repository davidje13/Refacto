const IRRELEVANT_WHITESPACE = /[ \t\v]+/g;
const PADDING = /^[ \r\n]+|[ \r\n]+$/g;

function sanitiseInput(value) {
  return value
    .replace(IRRELEVANT_WHITESPACE, ' ')
    .replace(PADDING, '');
}

function makeItem(category, message) {
  return {
    id: `temp-local-id-${Date.now()}`,
    category,
    created: Date.now(),
    message,
    votes: 0,
    done: false,
  };
}

export const setRetroState = (delta) => ({
  state: { $merge: delta },
});

export const addRetroItem = (category, message) => {
  const sanitisedMessage = sanitiseInput(message);
  if (!sanitisedMessage) {
    return null;
  }
  return {
    data: { items: { $push: [makeItem(category, sanitisedMessage)] } },
  };
};

function updateItem(itemId, updater) {
  return { data: { items: { $updateWhere: [['id', itemId], updater] } } };
}

export const editRetroItem = (itemId, message) => {
  const sanitisedMessage = sanitiseInput(message);
  if (!sanitisedMessage) {
    return null;
  }
  return updateItem(itemId, {
    message: { $set: sanitisedMessage },
  });
};

export const setRetroItemDone = (itemId, done) => updateItem(itemId, {
  done: { $set: done },
});

export const upvoteRetroItem = (itemId) => updateItem(itemId, {
  votes: { $add: 1 },
});

export const deleteRetroItem = (itemId) => ({
  data: { items: { $deleteWhere: ['id', itemId] } },
});

export const clearCovered = () => ({
  state: { $set: {} },
  data: {
    items: {
      $seq: [
        { $deleteWhere: { key: 'category', not: 'action' } },
        { $deleteWhere: { key: 'done', equals: true } },
      ],
    },
  },
});
