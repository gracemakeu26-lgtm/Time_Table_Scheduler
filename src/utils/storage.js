/**
 * Storage utility for managing localStorage
 */

const STORAGE_PREFIX = 'timetable_';

/**
 * Save data to localStorage
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 */
export const saveToStorage = (key, value) => {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(STORAGE_PREFIX + key, serialized);
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

/**
 * Get data from localStorage
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if key doesn't exist
 * @returns {any} - Stored value or default value
 */
export const getFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
};

/**
 * Remove data from localStorage
 * @param {string} key - Storage key
 */
export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

/**
 * Clear all app data from localStorage
 */
export const clearStorage = () => {
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(STORAGE_PREFIX))
      .forEach((key) => localStorage.removeItem(key));
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};

/**
 * Save user selection history
 */
export const saveSelectionHistory = (selection) => {
  const history = getFromStorage('selection_history', []);
  const updated = [
    selection,
    ...history.filter((h) => h.id !== selection.id),
  ].slice(0, 5);
  saveToStorage('selection_history', updated);
};

/**
 * Get user selection history
 */
export const getSelectionHistory = () => {
  return getFromStorage('selection_history', []);
};

/**
 * Re-export authAPI for convenience
 */
export { authAPI } from './api';
