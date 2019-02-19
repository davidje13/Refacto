import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import 'jest-enzyme';

Enzyme.configure({ adapter: new Adapter() });

// Capture all mounted items and automatically remove them at
// the end of each test (prevent interference & slowdown)

let enzymeMounted = null;
Enzyme.realMount = Enzyme.mount;
Enzyme.mount = (...args) => {
  const mounted = Enzyme.realMount(...args);
  enzymeMounted.push(mounted);
  return mounted;
};

beforeEach(() => {
  enzymeMounted = [];
});

afterEach(() => {
  enzymeMounted.forEach((item) => {
    if (item.length) {
      item.unmount();
    }
  });
  enzymeMounted = null;
});
