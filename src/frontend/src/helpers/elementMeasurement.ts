export function takeHeightMeasurements<T>(
  element: HTMLElement,
  fn: (measure: () => number) => T,
): T {
  const oldHeight = element.style.height;
  element.style.height = '1px';
  const result = fn(() => element.scrollHeight);
  element.style.height = oldHeight;
  return result;
}

export function getEmptyHeight(
  element: HTMLInputElement | HTMLTextAreaElement,
): number {
  return takeHeightMeasurements(element, (measure): number => {
    const oldValue = element.value;
    element.value = '';
    const height = measure();
    element.value = oldValue;
    return height;
  });
}

interface WithWithout<T> {
  withClass: T;
  withoutClass: T;
}

function measureMultiClassHeights<T>(
  element: HTMLElement,
  className: string,
  measure: () => T,
): WithWithout<T> {
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

export function getMultilClassHeights(
  element: HTMLElement,
  classElement: HTMLElement,
  className: string,
): WithWithout<number> {
  return takeHeightMeasurements(
    element,
    (measure) => measureMultiClassHeights(classElement, className, measure),
  );
}

export function getHeight(
  element: HTMLElement,
): number {
  return takeHeightMeasurements(element, (measure) => measure());
}
