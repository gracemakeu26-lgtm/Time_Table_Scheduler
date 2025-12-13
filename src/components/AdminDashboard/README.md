# AdminDashboard Module Structure

This directory contains the refactored components for the Admin Dashboard.

## Structure

```
components/AdminDashboard/
├── NavigationTabs.jsx          # Navigation tabs component
├── OverviewTab.jsx             # Overview tab (to be created)
├── TimetablesTab.jsx           # Timetables management tab (to be created)
├── DepartmentsTab.jsx          # Departments management tab (to be created)
├── TimetableViewTab.jsx        # Timetable view with clash detection (to be created)
├── AddTimetableModal.jsx       # Modal for adding timetables (to be created)
├── EditTimetableModal.jsx      # Modal for editing timetables (to be created)
├── AddSlotModal.jsx            # Modal for adding/editing slots (to be created)
└── DeleteConfirmationModal.jsx # Confirmation modal for deletions (to be created)
```

## Hooks

Located in `hooks/adminDashboard/`:

- `useAdminDashboard.js` - Main data fetching and state management
- `useTimetableView.js` - Timetable view logic and clash detection
- `useSlotAvailability.js` - Room and teacher availability checking

## Utilities

Located in `utils/adminDashboard/`:

- `timetableHelpers.js` - Day conversion, time formatting utilities
- `clashDetection.js` - Clash detection algorithms

## Constants

Located in `constants/adminDashboard.js`:

- `DAY_MAP` - Day number to name mapping
- `DAY_NAME_TO_NUMBER` - Day name to number mapping
- `ADMIN_TABS` - Tab configuration
