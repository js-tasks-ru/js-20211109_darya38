/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const properties = path.split('.');

  return (object) => {
    let currentObject = object;
   
    for (const prop of properties) {
      if (currentObject === undefined) {
        break;
      }

      currentObject = currentObject[prop];
    }

    return currentObject;
  };
}