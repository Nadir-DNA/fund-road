
/**
 * Utility functions for handling navigation and path tracking
 */

// Save the current path to localStorage for later navigation
export const saveCurrentPath = () => {
  try {
    localStorage.setItem('lastPath', window.location.pathname + window.location.search);
  } catch (error) {
    console.error('Error saving path to localStorage:', error);
  }
};

// Get the last saved path or a default path
export const getLastPath = (defaultPath = '/') => {
  try {
    return localStorage.getItem('lastPath') || defaultPath;
  } catch (error) {
    console.error('Error getting path from localStorage:', error);
    return defaultPath;
  }
};

// Clear the last saved path
export const clearLastPath = () => {
  try {
    localStorage.removeItem('lastPath');
  } catch (error) {
    console.error('Error clearing path from localStorage:', error);
  }
};

// Build a resource URL for navigation
export const buildResourceUrl = (stepId: number, substepTitle: string, resourceName: string) => {
  return `/roadmap?step=${stepId}&substep=${encodeURIComponent(substepTitle)}&resource=${encodeURIComponent(resourceName)}`;
};

// Extract query parameters from URL string
export const getQueryParams = (url: string) => {
  try {
    const parsedUrl = new URL(url, window.location.origin);
    return Object.fromEntries(parsedUrl.searchParams.entries());
  } catch (error) {
    console.error('Error parsing URL:', error);
    return {};
  }
};
