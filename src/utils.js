function isObject(val) {
  return (typeof val === 'object') ? val !== null : false;
}

export function isSubset(candidate, authority) {
  if (!isObject(candidate)) return true;
  if (!isObject(authority)) return false;
  return Object.keys(candidate).every(candidateKey => {
    if (authority[candidateKey] === undefined) return false;
    if (typeof candidate[candidateKey] === 'object')
      return isSubset(candidate[candidateKey], authority[candidateKey]);
    return true;
  });
}
