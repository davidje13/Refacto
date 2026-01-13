import { createElement, useEffect, useRef } from 'react';
import { generate, correction } from 'lean-qr';
import { makeAsyncComponent } from 'lean-qr/extras/react';

export const QR = makeAsyncComponent(
  { createElement, useEffect, useRef },
  generate,
  { minCorrectionLevel: correction.Q },
);
