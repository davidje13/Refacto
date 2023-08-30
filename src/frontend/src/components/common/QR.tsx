import React from 'react';
import { generate, correction } from 'lean-qr';
import { makeAsyncComponent } from 'lean-qr/extras/react';

export default makeAsyncComponent(React, generate, {
  minCorrectionLevel: correction.Q,
});
