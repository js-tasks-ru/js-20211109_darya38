/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  const sortedArray = Array.from(arr);

  const directions = {
    asc: 1,
    desc: -1
  };

  const direction = directions[param];
  
  return sortedArray.sort((firstString, secondString) => {
    return direction * firstString.localeCompare(secondString, ['ru', 'en'], {sensitivity: 'variant', caseFirst: 'upper'});
  });
}
