/**
 * invertObj - should swap object keys and values
 * @param {object} obj - the initial object
 * @returns {object | undefined} - returns new object or undefined if nothing did't pass
 */
export function invertObj(obj) {
  const result = {};

  if (obj === undefined) {
    return obj;
  }

  for (const [key, value] of Object.entries(obj)) {
    result[value] = key;
  }

  return result;
}
