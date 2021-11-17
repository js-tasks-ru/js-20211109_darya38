/**
 * pick - Creates an object composed of the picked object properties:
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to pick
 * @returns {object} - returns the new object
 */
export const pick = (obj, ...fields) => {
  const result = {};

  for (const prop of fields) {
    if (prop in obj) {
      result[prop] = obj[prop];
    }    
  }

  return result;
};
