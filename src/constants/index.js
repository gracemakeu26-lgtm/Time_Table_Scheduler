// Navigation configuration
export const NAV_LINKS = [
  { to: '/', label: 'Home', showOn: ['all'] },
  { to: '/student', label: 'Timetable', showOn: ['all'], hideOn: [] },
  {
    to: '/login',
    label: 'Admin Login',
    showOn: ['all'],
    hideOn: ['/login'],
  },
];

// Days of the week
export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Time slots for timetable
export const TIME_SLOTS = [
  '08:00 - 10:00',
  '10:00 - 12:00',
  '13:00 - 15:00',
  '15:00 - 17:00',
];

// Weeks configuration
export const WEEKS = [
  { id: '1', name: 'Week 1' },
  { id: '2', name: 'Week 2' },
  { id: '3', name: 'Week 3' },
  { id: '4', name: 'Week 4' },
];

// Course types
export const COURSE_TYPES = {
  LECTURE: 'Lecture',
  LAB: 'Lab Work',
  TUTORIAL: 'Tutorial',
};

// University information
export const UNIVERSITY_INFO = {
  name: 'University of Yaoundé I',
  shortName: 'UY1',
  phone: '(+237) 222 22 13 20',
  email: 'rectorat@univ-yaounde1.cm',
  address: 'B.P. 337, Yaoundé',
  website: 'https://www.uy1.uninet.cm/',
  students: '15000+',
  faculties: '5',
};

// Application metadata
export const APP_INFO = {
  name: 'UniScheduler',
  tagline: 'Simplified timetable consultation',
  description:
    'UniScheduler is a platform that allows students, teachers and parents to view timetables',
  year: new Date().getFullYear(),
};

// Step navigation for StudentPortal
export const STUDENT_PORTAL_STEPS = [
  { id: 1, name: 'Faculties', icon: 'faculty' },
  { id: 2, name: 'Departments', icon: 'department' },
  { id: 3, name: 'Programs', icon: 'program' },
  { id: 4, name: 'Timetable', icon: 'timetable' },
];
