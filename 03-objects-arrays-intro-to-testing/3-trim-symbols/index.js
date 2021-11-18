/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  let resultString = "";
  
  if (size === undefined) {
    resultString = string;
    return resultString;
  }
  
  let equalsCount = 0;
  for (let pos = 0; pos < string.length; ++pos) {
    if ((pos === 0) || (string[pos] === string[pos - 1])) {
      equalsCount += 1; 
    }
    else {
      equalsCount = 1;
    }

    if (equalsCount <= size) {
      resultString += string[pos];  
    }
  }

  return resultString;
}
