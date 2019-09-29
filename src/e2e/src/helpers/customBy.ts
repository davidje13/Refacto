import { By } from 'selenium-webdriver';

export default {
  buttonText(text: string): By {
    return By.xpath(`//button[text()="${text}"]`);
  },
};
