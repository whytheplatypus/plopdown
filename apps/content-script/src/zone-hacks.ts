/***************************************************************************************************
 * Hacks for ZoneJS to call some methods via the window.
 *
 * Restricted content-script contexts require
 * methods like clearTimeout and clearInterval
 * to be called with `window` as `this`.
 */
const patchedClearTimeout = window.clearTimeout;
console.log(patchedClearTimeout);
window.clearTimeout = function (...args) {
  return patchedClearTimeout.apply(window, args);
};

const patchedClearInterval = window.clearInterval;
console.log(patchedClearInterval);
window.clearInterval = function (...args) {
  return patchedClearInterval.apply(window, args);
};
