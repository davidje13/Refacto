import { By } from 'selenium-webdriver';

export function ByButtonText(text: string): By {
  return By.xpath(`//button[text()="${text}"]`);
}
