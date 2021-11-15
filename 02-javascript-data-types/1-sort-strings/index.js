/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  let sortedArray = Array.from(arr);  
  
  sortedArray.sort((firstString, secondString) => firstString.localeCompare(secondString, ['ru', 'en'], {sensitivity: 'variant', caseFirst: 'upper'}));

  return param == 'asc' ? sortedArray : sortedArray.reverse();
}
