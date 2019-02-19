export default {
  noElementLocated: (by) => async (driver) => {
    const elements = await driver.findElements(by);
    return elements.length === 0;
  },
};
