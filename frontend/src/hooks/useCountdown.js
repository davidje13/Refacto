import { useState, useEffect } from 'react';

// useCountdown(targetTime, [interval, [getTime]])
// Returns the number of milliseconds remaining until targetTime (quantised by
// interval). Automatically refreshes remaining time.
// Once targetTime has been reached, returns -1.

function throttle(delay) {
  if (global.document && document.hidden) {
    // Page is not visible, so throttle the callback to save user's CPU
    return Math.max(delay, 500);
  }
  return delay;
}

function setSmallTimeout(fn, delay) {
  const result = {};

  if (delay < 10 && global.requestAnimationFrame) {
    result.frame = requestAnimationFrame(fn);
  } else {
    result.timer = setTimeout(fn, delay);
    if (global.window) {
      // Timers can be inaccurate when in the background,
      // so check state of the world when we regain focus
      result.focus = fn;
      window.addEventListener('focus', result.focus);
    }
  }

  return result;
}

function clearSmallTimeout(timeout) {
  if (timeout.focus) {
    window.removeEventListener('focus', timeout.focus);
  }
  if (timeout.timer) {
    clearTimeout(timeout.timer);
  }
  if (timeout.frame) {
    cancelAnimationFrame(timeout.frame);
  }
}

function quantise(remaining, interval) {
  return (Math.ceil(remaining / interval) - 1) * interval;
}

function useRerender() {
  const [renderFrame, setRenderFrame] = useState(0);
  return () => setRenderFrame(renderFrame + 1);
}

export default function useCountdown(targetTime, interval = 50, getTime = Date.now) {
  const now = getTime();
  const rerender = useRerender();

  useEffect(() => {
    if (now >= targetTime) {
      return undefined;
    }
    let delay = (targetTime - now) % interval;
    if (delay === 0) {
      delay = interval;
    }
    const timeout = setSmallTimeout(rerender, throttle(delay));
    return () => clearSmallTimeout(timeout);
  });

  return Math.max(quantise(targetTime - now, interval), -1);
}
