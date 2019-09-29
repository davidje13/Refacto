import * as Router from 'react-router-dom';
import { useContext } from 'react';

// https://github.com/ReactTraining/react-router/issues/6430

// this exists to make testing easier when routing is irrelevant
const NO_ROUTER = {
  history: { location: { pathname: '' } },
  location: { pathname: '' },
  match: {},
  staticContext: {},
};

export default function useRouter(): Router.RouteComponentProps {
  // eslint-disable-next-line no-underscore-dangle
  return useContext((Router as any).__RouterContext) || NO_ROUTER;
}
