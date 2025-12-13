// Constants for Admin Dashboard

// Map day numbers to day names
export const DAY_MAP = {
  0: 'Monday',
  1: 'Tuesday',
  2: 'Wednesday',
  3: 'Thursday',
  4: 'Friday',
  5: 'Saturday',
  6: 'Sunday',
};

// Day name to number mapping
export const DAY_NAME_TO_NUMBER = {
  Monday: 0,
  Tuesday: 1,
  Wednesday: 2,
  Thursday: 3,
  Friday: 4,
  Saturday: 5,
  Sunday: 6,
};

// Display days for timetable grid
export const DISPLAY_DAYS = [0, 1, 2, 3, 4, 5]; // Monday to Saturday

// Time slots for display
export const TIME_SLOTS = [
  '08:00 - 09:00',
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00',
  '12:00 - 13:00',
  '13:00 - 14:00',
  '14:00 - 15:00',
  '15:00 - 16:00',
  '16:00 - 17:00',
  '17:00 - 18:00',
  '18:00 - 19:00',
];

// Tab configuration
export const ADMIN_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'timetables', label: 'Timetables' },
  { id: 'faculty', label: 'Departments' },
  { id: 'timetable-view', label: 'Timetable View' },
  { id: 'settings', label: 'Settings' },
];
