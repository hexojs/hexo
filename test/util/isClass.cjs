/**
 * Checks if a value is a class constructor.
 * @param {*} value - The value to check.
 * @returns {boolean} True if the value is a class constructor, false otherwise.
 */
function isClass(value) {
  return typeof value === 'function' && /^class\s/.test(Function.prototype.toString.call(value));
}

module.exports = isClass;
