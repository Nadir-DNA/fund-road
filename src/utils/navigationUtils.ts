
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

// Redirect helper to handle return to previous routes
export const getReturnPath = (defaultPath: string = '/roadmap'): string => {
  const lastPath = getLastPath();
  clearLastPath();
  return lastPath || defaultPath;
};
