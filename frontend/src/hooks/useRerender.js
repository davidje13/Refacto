import { useState } from 'react';

export default function useRerender() {
  const [, setRenderFrame] = useState(0);
  return () => setRenderFrame((frame) => (frame + 1));
}
