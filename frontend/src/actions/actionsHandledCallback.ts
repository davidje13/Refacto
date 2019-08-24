export default (callback: () => void) => (): null => {
  callback();
  return null;
};
