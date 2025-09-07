export const asyncHandler = (fn: Function) => {
  return (...args: any[]) => {
    return Promise.resolve(fn(...args)).catch(args[2]);
  };
};
