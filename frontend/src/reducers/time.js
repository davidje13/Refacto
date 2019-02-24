import update from 'immutability-helper';

const initialState = {
  localDateProvider: null,
};

export const setLocalDateProvider = (localDateProvider) => ({
  type: 'SET_LOCAL_DATE_PROVIDER',
  localDateProvider,
});

export default (state = initialState, action) => {
  switch (action.type) {
    case 'SET_LOCAL_DATE_PROVIDER':
      return update(state, {
        localDateProvider: { $set: action.localDateProvider },
      });
    default:
      return state;
  }
};
