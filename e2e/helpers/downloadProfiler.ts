import type { WebDriver } from 'selenium-webdriver';

const getResourcesSignature = (driver: WebDriver) =>
  driver.executeScript<string>(
    'return JSON.stringify(performance.getEntriesByType("resource")[0]);',
  );

const snapshotDownloadedBytes = (driver: WebDriver) =>
  driver.executeScript<number>(`
    return performance
      .getEntriesByType("resource")
      .map((x) => x.transferSize)
      .reduce((a, b) => (a + b), 0);
  `);

export async function getDownloadedBytes(
  driver: WebDriver,
  operation: (driver: WebDriver) => Promise<void>,
): Promise<number> {
  const begin = await snapshotDownloadedBytes(driver);
  const beginSig = await getResourcesSignature(driver);

  await operation(driver);

  const end = await snapshotDownloadedBytes(driver);
  const endSig = await getResourcesSignature(driver);

  if (beginSig !== endSig) {
    // a page navigation occurred; 'end' does not include old data from 'begin'
    return end;
  }
  return end - begin;
}

export const Mbps = (bits: number) => (bits * 1000000) / 8;
