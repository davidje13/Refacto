import ReactDOM from 'react-dom';

// Enzyme has some issues with newer React features (e.g. React.memo)
// So it is sometimes necessary to fall-back to react-dom rendering instead.

let root = null;
export default function renderDOM(component) {
  if (!root) {
    root = document.createElement('div');
    document.body.appendChild(root);
  }
  ReactDOM.render(component, root);
  return root;
}

afterEach(() => {
  if (root) {
    document.body.removeChild(root);
    root = null;
  }
});
