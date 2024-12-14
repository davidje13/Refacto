import { useState } from 'react';

export function useBoolean(initial: boolean) {
  const [value, setValue] = useState(initial);
  const [setters] = useState(() => ({
    setTrue: () => setValue(true),
    setFalse: () => setValue(false),
  }));
  return { value, setValue, ...setters };
}
