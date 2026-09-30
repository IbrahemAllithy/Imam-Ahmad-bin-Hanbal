/**
 * Async Handler Wrapper
 * يغلّف الـ async functions لتجنب try-catch المتكررة
 */

export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;
