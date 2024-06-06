export const getHashParameter = (param: string) => {
  const hash = window.location.hash;
  const hashWithoutHash = hash.startsWith("#") ? hash.substring(1) : hash;
  const params = new URLSearchParams(hashWithoutHash);
  return params.get(param);
};
