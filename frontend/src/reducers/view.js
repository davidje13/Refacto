import update from 'immutability-helper';

const initialState = {
  windowWidth: 0,
  windowHeight: 0,
};

export const setWindowSize = (width, height) => ({
  type: 'SET_WINDOW_SIZE',
  width,
  height,
});

export default (state = initialState, action) => {
  switch (action.type) {
    case 'SET_WINDOW_SIZE':
      return update(state, {
        windowWidth: { $set: action.width },
        windowHeight: { $set: action.height },
      });
    default:
      return state;
  }
};
