// Utility functions for timetable operations

import { DAY_MAP, DAY_NAME_TO_NUMBER } from '../../constants/adminDashboard';

/**
 * Convert day number to day name
 * @param {number|string} dayNum - Day number (0-6) or day name string
 * @returns {string} Day name
 */
export const dayNumberToName = (dayNum) => {
  if (typeof dayNum === 'string') return dayNum; // Already a name
  return DAY_MAP[dayNum] || '';
};

/**
 * Convert day name to day number
 * @param {string} dayName - Day name (e.g., "Monday")
 * @returns {number|null} Day number (0-6) or null if invalid
 */
export const dayNameToNumber = (dayName) => {
  return DAY_NAME_TO_NUMBER[dayName] !== undefined
    ? DAY_NAME_TO_NUMBER[dayName]
    : null;
};

/**
 * Parse time string to minutes for sorting
 * @param {string} timeStr - Time string in HH:MM format
 * @returns {number} Minutes since midnight
 */
export const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + (minutes || 0);
};

/**
 * Format time slot
 * @param {string} startTime - Start time in HH:MM format
 * @param {string} endTime - End time in HH:MM format
 * @returns {string} Formatted time slot string
 */
export const formatTimeSlot = (startTime, endTime) => {
  if (typeof startTime === 'string' && typeof endTime === 'string') {
    return `${startTime} - ${endTime}`;
  }
  return `${startTime} - ${endTime}`;
};
