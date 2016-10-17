function isObject(val) {
  return (typeof val === 'object') ? val !== null : false;
}

export function isSubset(candidate, authority) {
  if (!isObject(candidate)) return true;
  if (!isObject(authority)) return false;
  return Object.keys(candidate).every(candidateKey => {
    if (authority[candidateKey] === undefined) return false;
    const candidateVal = candidate[candidateKey];
    if (typeof candidateVal === 'object' && !Array.isArray(candidateVal))
      return isSubset(candidate[candidateKey], authority[candidateKey]);
    return true;
  });
}
