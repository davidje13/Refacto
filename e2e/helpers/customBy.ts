import { By } from 'selenium-webdriver';

export const byButtonText = (text: string) =>
  By.xpath(`//button[text()="${text}"]`);
