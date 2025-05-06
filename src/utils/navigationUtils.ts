// Add this function to the existing file

export const isBrowser = () => typeof window !== 'undefined';

export const saveResourceReturnPath = (path: string) => {
  if (isBrowser()) {
    localStorage.setItem('resourceReturnPath', path);
    console.log(`Saved return path: ${path}`);
  }
};

export const getResourceReturnPath = () => {
  if (isBrowser()) {
    return localStorage.getItem('resourceReturnPath');
  }
  return null;
};

export const clearResourceReturnPath = () => {
  if (isBrowser()) {
    localStorage.removeItem('resourceReturnPath');
  }
};

export const buildResourceUrl = (stepId: number, substepTitle: string, resourceName: string) => {
  const encodedSubstep = encodeURIComponent(substepTitle);
  return `/step/${stepId}/${encodedSubstep}/resource/${resourceName}`;
};
