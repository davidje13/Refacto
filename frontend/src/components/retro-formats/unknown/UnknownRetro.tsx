import React from 'react';

const UnknownRetro = (): React.ReactElement => (
  <div className="retro-format-unknown">
    <p>Please refresh the page to see this retro.</p>
  </div>
);

export default React.memo(UnknownRetro);
