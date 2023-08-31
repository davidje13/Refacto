import React from 'react';
import { generate, correction } from 'lean-qr';
import { makeAsyncComponent } from 'lean-qr/extras/react';

export const QR = makeAsyncComponent(React, generate, {
  minCorrectionLevel: correction.Q,
});
