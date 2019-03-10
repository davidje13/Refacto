import { useState } from 'react';

export default function useRerender() {
  const [renderFrame, setRenderFrame] = useState(0);
  return () => setRenderFrame(renderFrame + 1);
}
