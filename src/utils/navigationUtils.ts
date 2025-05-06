
// Define return path storage keys
const RESOURCE_RETURN_PATH_KEY = 'resourceReturnPath';
const LAST_PATH_KEY = 'lastPath';

// Check if code is running in browser environment
export const isBrowser = (): boolean => {
  return typeof window !== 'undefined';
};

// Build a URL for resource access
export const buildResourceUrl = (stepId: number, substepTitle: string, resourceComponentName: string): string => {
  const encodedSubstep = encodeURIComponent(substepTitle);
  return `/roadmap/step/${stepId}/${encodedSubstep}?resource=${resourceComponentName}`;
};

// Save the path to return to after viewing a resource
export const saveResourceReturnPath = (path: string): void => {
  localStorage.setItem(RESOURCE_RETURN_PATH_KEY, path);
};

// Get the resource return path
export const getResourceReturnPath = (): string | null => {
  return localStorage.getItem(RESOURCE_RETURN_PATH_KEY);
};

// Clear the resource return path
export const clearResourceReturnPath = (): void => {
  localStorage.removeItem(RESOURCE_RETURN_PATH_KEY);
};

// Save the current path for later return (e.g. after authentication)
export const saveCurrentPath = (path: string): void => {
  localStorage.setItem(LAST_PATH_KEY, path);
};

// Get the last saved path
export const getLastPath = (): string | null => {
  return localStorage.getItem(LAST_PATH_KEY);
};

// Clear the last saved path
export const clearLastPath = (): void => {
  localStorage.removeItem(LAST_PATH_KEY);
};
