function isObject(val) {
  return (typeof val === 'object') ? val !== null : false;
}

export function isSubset(candidate, authority) {
  if (!isObject(candidate)) return true;
  return Object.keys(candidate).every(candidateKey => {
    if (!isObject(authority)) return false;
    if (authority[candidateKey] !== 'undefined') return false;
    if (typeof candidate[candidateKey] === 'object')
      return isSubset(authority[candidateKey], candidate[candidateKey]);
    return true;
  });
}
