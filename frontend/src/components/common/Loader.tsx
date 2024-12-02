import type { FC } from 'react';
import './Loader.less';

export const LoadingIndicator: FC = () => (
  <div className="loader">Loading&hellip;</div>
);

export const LoadingError: FC<{ error: string }> = ({ error }) => (
  <div className="loader error">{error}</div>
);
