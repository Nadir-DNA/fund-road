
// Navigation utility functions

// Store the last path the user visited
export const saveLastPath = (path: string) => {
  localStorage.setItem('last_path', path);
};

// Clear the last path
export const clearLastPath = () => {
  localStorage.removeItem('last_path');
};

// Get the last path the user visited
export const getLastPath = (): string | null => {
  return localStorage.getItem('last_path');
};

// Save the current path for returning later
export const saveCurrentPath = (path: string) => {
  localStorage.setItem('current_path', path);
};

// Get the current path
export const getCurrentPath = (): string | null => {
  return localStorage.getItem('current_path');
};

// Clear the current path
export const clearCurrentPath = () => {
  localStorage.removeItem('current_path');
};

// Store the resource return path
export const saveResourceReturnPath = (path: string) => {
  localStorage.setItem('resource_return_path', path);
};

// Get the resource return path
export const getResourceReturnPath = (): string | null => {
  return localStorage.getItem('resource_return_path');
};

// Clear the resource return path
export const clearResourceReturnPath = () => {
  localStorage.removeItem('resource_return_path');
};

// Redirect helper to handle return to previous routes
export const getReturnPath = (defaultPath: string = '/roadmap'): string => {
  const lastPath = getLastPath();
  clearLastPath();
  return lastPath || defaultPath;
};

// Build a resource URL from step and substep information
export const buildResourceUrl = (stepId: number, substepTitle: string | null, resourceName: string): string => {
  if (substepTitle) {
    return `/roadmap/step/${stepId}/${encodeURIComponent(substepTitle)}?resource=${resourceName}`;
  } else {
    return `/roadmap/step/${stepId}?resource=${resourceName}`;
  }
};

// Helper to check if code is running in browser
export const isBrowser = (): boolean => {
  return typeof window !== 'undefined';
};
