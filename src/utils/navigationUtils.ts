
/**
 * Utility functions for handling navigation and path tracking
 */

// Save the current path to localStorage for later navigation
export const saveCurrentPath = () => {
  try {
    const currentPath = window.location.pathname + window.location.search;
    // Don't save auth page as a return destination
    if (!currentPath.startsWith('/auth')) {
      localStorage.setItem('lastPath', currentPath);
    }
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

// Check if we're running in a browser environment
export const isBrowser = () => typeof window !== 'undefined';

// Safely handle URL parameter encoding/decoding
export const safeEncodeURIComponent = (str: string) => {
  if (!str) return '';
  return encodeURIComponent(str);
};

export const safeDecodeURIComponent = (str: string) => {
  if (!str) return '';
  try {
    return decodeURIComponent(str);
  } catch (e) {
    console.error('Error decoding URI component:', e);
    return str;
  }
};
