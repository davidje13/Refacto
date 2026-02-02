import { memo } from 'react';
import { LoadingError } from '../../common/Loader';

export const UnknownRetro = memo(() => (
  <div className="retro-format-unknown">
    <LoadingError error="Please refresh the page to see this retro." />
  </div>
));
