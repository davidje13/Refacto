const crypto = {
  getRandomValues: (target: Uint8Array): void => {
    const outVar = target; // mutate input variable (but keep linter happy)
    for (let i = 0; i < outVar.length; i += 1) {
      outVar[i] = i;
    }
  },
};

(global as any).crypto = crypto;
export default crypto;
