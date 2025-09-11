
// Define return path storage keys
const RESOURCE_RETURN_PATH_KEY = 'resourceReturnPath';
const LAST_PATH_KEY = 'lastPath';
const LAST_SAVE_KEY = 'lastSaveTime';
const SAVE_STATUS_KEY = 'saveStatus';

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
  if (isBrowser()) {
    localStorage.setItem(RESOURCE_RETURN_PATH_KEY, path);
    console.log("Resource return path saved:", path);
  }
};

// Get the resource return path
export const getResourceReturnPath = (): string | null => {
  if (!isBrowser()) return null;
  return localStorage.getItem(RESOURCE_RETURN_PATH_KEY);
};

// Clear the resource return path
export const clearResourceReturnPath = (): void => {
  if (isBrowser()) {
    localStorage.removeItem(RESOURCE_RETURN_PATH_KEY);
    console.log("Resource return path cleared");
  }
};

// Save the current path for later return (e.g. after authentication)
export const saveLastPath = (path: string): void => {
  if (isBrowser()) {
    localStorage.setItem(LAST_PATH_KEY, path);
    console.log("Last path saved for redirection:", path);
  }
};

// Save the current path (alias for saveLastPath for backward compatibility)
export const saveCurrentPath = (path: string): void => {
  saveLastPath(path);
};

// Get the last saved path
export const getLastPath = (): string | null => {
  if (!isBrowser()) return null;
  return localStorage.getItem(LAST_PATH_KEY);
};

// Clear the last saved path
export const clearLastPath = (): void => {
  if (isBrowser()) {
    localStorage.removeItem(LAST_PATH_KEY);
    console.log("Last path cleared");
  }
};

// Save time of last successful data save
export const saveLastSaveTime = (): void => {
  if (isBrowser()) {
    const now = new Date().toISOString();
    localStorage.setItem(LAST_SAVE_KEY, now);
    localStorage.setItem(SAVE_STATUS_KEY, 'success');
    console.log("Last save time recorded:", now);
  }
};

// Get last save time
export const getLastSaveTime = (): string | null => {
  if (!isBrowser()) return null;
  return localStorage.getItem(LAST_SAVE_KEY);
};

// Mark save as failed
export const markSaveFailed = (): void => {
  if (isBrowser()) {
    localStorage.setItem(SAVE_STATUS_KEY, 'failed');
  }
};

// Check if last save was successful
export const wasSaveSuccessful = (): boolean => {
  if (!isBrowser()) return false;
  return localStorage.getItem(SAVE_STATUS_KEY) === 'success';
};

// Format the last save time for display
export const formatLastSaveTime = (timeString: string | null): string => {
  if (!timeString) return "";
  
  try {
    const date = new Date(timeString);
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch (e) {
    return "";
  }
};
