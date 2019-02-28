export function takeHeightMeasurements(element, fn) {
  /* eslint-disable no-param-reassign */ // temporary mutation is necessary for measurement

  const oldHeight = element.style.height;
  element.style.height = '1px';
  const result = fn(() => element.scrollHeight);
  element.style.height = oldHeight;
  return result;

  /* eslint-enable no-param-reassign */
}

export function getEmptyHeight(element) {
  return takeHeightMeasurements(element, (measure) => {
    /* eslint-disable no-param-reassign */ // temporary mutation is necessary for measurement

    const oldValue = element.value;
    element.value = '';
    const height = measure();
    element.value = oldValue;
    return height;

    /* eslint-enable no-param-reassign */
  });
}

function measureMultiClassHeights(element, className, measure) {
  let withClass;
  let withoutClass;

  // Order operations to minimise number of CSS recalculations

  if (element.classList.contains(className)) {
    element.classList.remove(className);
    withoutClass = measure();

    element.classList.add(className);
    withClass = measure();
  } else {
    element.classList.add(className);
    withClass = measure();

    element.classList.remove(className);
    withoutClass = measure();
  }

  return { withClass, withoutClass };
}

export function getMultilClassHeights(element, classElement, className) {
  return takeHeightMeasurements(
    element,
    (measure) => measureMultiClassHeights(classElement, className, measure),
  );
}
