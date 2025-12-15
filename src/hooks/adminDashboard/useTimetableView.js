import { useState, useEffect, useMemo } from 'react';
import { timetablesAPI } from '../../utils/api';
import {
  detectClashes,
  timeToMinutes,
  formatTimeSlot,
} from '../../utils/adminDashboard';
import { DAY_MAP } from '../../constants/adminDashboard';

/**
 * Custom hook for Timetable View tab data and logic
 */
export const useTimetableView = () => {
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedDepartmentView, setSelectedDepartmentView] = useState('');
  const [selectedLevelView, setSelectedLevelView] = useState('');
  const [viewMode, setViewMode] = useState('level'); // 'level', 'department', 'room'
  const [timetablesWithSlots, setTimetablesWithSlots] = useState([]);
  const [loadingTimetablesWithSlots, setLoadingTimetablesWithSlots] =
    useState(false);

  // Fetch timetables with slots in background (lazy load - only when needed)
  useEffect(() => {
    // Only fetch if timetablesWithSlots is empty and not currently loading
    if (timetablesWithSlots.length === 0 && !loadingTimetablesWithSlots) {
      const fetchTimetablesWithSlots = async () => {
        setLoadingTimetablesWithSlots(true);
        try {
          const timetablesWithSlotsData = await timetablesAPI.getAll({
            include_slots: true,
          });
          setTimetablesWithSlots(
            Array.isArray(timetablesWithSlotsData)
              ? timetablesWithSlotsData
              : timetablesWithSlotsData.data || [],
          );
        } catch (err) {
          console.error('Error fetching timetables with slots:', err);
          // Don't set error here, just log it - this is background loading
        } finally {
          setLoadingTimetablesWithSlots(false);
        }
      };

      // Fetch in background after initial render (non-blocking)
      const timer = setTimeout(() => {
        fetchTimetablesWithSlots();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [timetablesWithSlots.length, loadingTimetablesWithSlots]);

  const availableSemesters = useMemo(() => {
    if (!timetablesWithSlots || timetablesWithSlots.length === 0) return [];
    const semesters = new Set();
    timetablesWithSlots.forEach((tt) => {
      if (tt && tt.semester) semesters.add(tt.semester);
    });
    return Array.from(semesters).sort();
  }, [timetablesWithSlots]);

  const availableYears = useMemo(() => {
    if (!timetablesWithSlots || timetablesWithSlots.length === 0) return [];
    const years = new Set();
    timetablesWithSlots.forEach((tt) => {
      if (tt && tt.academic_year) years.add(tt.academic_year);
    });
    return Array.from(years).sort();
  }, [timetablesWithSlots]);

  const filteredTimetables = useMemo(() => {
    if (!timetablesWithSlots || timetablesWithSlots.length === 0) return [];
    try {
      return timetablesWithSlots.filter((tt) => {
        if (!tt) return false;
        if (selectedSemester && selectedSemester !== '') {
          if (!tt.semester || tt.semester !== selectedSemester) return false;
        }
        if (selectedYear && selectedYear !== '') {
          if (!tt.academic_year || tt.academic_year !== selectedYear)
            return false;
        }
        if (selectedDepartmentView && selectedDepartmentView !== '') {
          const deptId = parseInt(selectedDepartmentView, 10);
          if (isNaN(deptId) || !tt.department_id || tt.department_id !== deptId)
            return false;
        }
        if (selectedLevelView && selectedLevelView !== '') {
          const levelId = parseInt(selectedLevelView, 10);
          if (isNaN(levelId)) return false;
          if (tt.level_id === null || tt.level_id === undefined) return false;
          if (tt.level_id !== levelId) return false;
        }
        return true;
      });
    } catch (error) {
      console.error('Error filtering timetables:', error);
      return [];
    }
  }, [
    timetablesWithSlots,
    selectedSemester,
    selectedYear,
    selectedDepartmentView,
    selectedLevelView,
  ]);

  const allSlots = useMemo(() => {
    if (!filteredTimetables || filteredTimetables.length === 0) return [];
    const slots = [];
    filteredTimetables.forEach((tt) => {
      if (!tt) return;
      if (tt.slots && Array.isArray(tt.slots)) {
        tt.slots.forEach((slot) => {
          if (!slot) return;
          slots.push({
            ...slot,
            timetable_name: tt.name || 'Unknown Timetable',
            department_name: tt.department_name || 'Unknown Department',
            level_name: tt.level_name || null,
            level_code: (tt.level && tt.level.code) || slot.level_code || '',
            semester: tt.semester || null,
            academic_year: tt.academic_year || null,
          });
        });
      }
    });
    return slots;
  }, [filteredTimetables]);

  const clashes = useMemo(() => {
    return detectClashes(allSlots);
  }, [allSlots]);

  const groupedSlots = useMemo(() => {
    if (!allSlots || allSlots.length === 0) return new Map();
    const groups = new Map();
    if (viewMode === 'level') {
      allSlots.forEach((slot) => {
        if (!slot) return;
        const key = slot.level_code || slot.level_name || 'Unknown';
        if (!groups.has(key)) {
          groups.set(key, []);
        }
        groups.get(key).push(slot);
      });
    } else if (viewMode === 'department') {
      allSlots.forEach((slot) => {
        if (!slot) return;
        const key = slot.department_name || 'Unknown';
        if (!groups.has(key)) {
          groups.set(key, []);
        }
        groups.get(key).push(slot);
      });
    } else if (viewMode === 'room') {
      allSlots.forEach((slot) => {
        if (!slot) return;
        const key = slot.room_name || 'Unknown';
        if (!groups.has(key)) {
          groups.set(key, []);
        }
        groups.get(key).push(slot);
      });
    }
    groups.forEach((slots) => {
      slots.sort((a, b) => {
        if (!a || !b) return 0;
        if (a.day_of_week !== b.day_of_week) {
          return (a.day_of_week || 0) - (b.day_of_week || 0);
        }
        const timeA = a.start_time ? timeToMinutes(a.start_time) : 0;
        const timeB = b.start_time ? timeToMinutes(b.start_time) : 0;
        return timeA - timeB;
      });
    });
    return groups;
  }, [allSlots, viewMode]);

  const displayDays = useMemo(() => {
    if (!allSlots || allSlots.length === 0) return [];
    const days = new Set();
    allSlots.forEach((slot) => {
      if (slot && slot.day_of_week !== null && slot.day_of_week !== undefined) {
        days.add(slot.day_of_week);
      }
    });
    return Array.from(days).sort();
  }, [allSlots]);

  const displayTimes = useMemo(() => {
    if (!allSlots || allSlots.length === 0) return [];
    const times = new Set();
    allSlots.forEach((slot) => {
      if (slot && slot.start_time && slot.end_time) {
        const timeSlot = formatTimeSlot(slot.start_time, slot.end_time);
        if (timeSlot && timeSlot !== 'TBA') {
          times.add(timeSlot);
        }
      }
    });
    return Array.from(times).sort((a, b) => {
      const timeA = a.split(' - ')[0];
      const timeB = b.split(' - ')[0];
      return timeToMinutes(timeA) - timeToMinutes(timeB);
    });
  }, [allSlots]);

  const hasClash = (slot) => {
    if (!slot || !slot.id || !clashes || clashes.length === 0) return false;
    return clashes.some(
      (clash) =>
        (clash.slot1 && clash.slot1.id === slot.id) ||
        (clash.slot2 && clash.slot2.id === slot.id),
    );
  };

  const getClashDetails = (slot) => {
    if (!slot || !slot.id || !clashes || clashes.length === 0) return [];
    return clashes.filter(
      (clash) =>
        (clash.slot1 && clash.slot1.id === slot.id) ||
        (clash.slot2 && clash.slot2.id === slot.id),
    );
  };

  return {
    selectedSemester,
    setSelectedSemester,
    selectedYear,
    setSelectedYear,
    selectedDepartmentView,
    setSelectedDepartmentView,
    selectedLevelView,
    setSelectedLevelView,
    viewMode,
    setViewMode,
    timetablesWithSlots,
    loadingTimetablesWithSlots,
    availableSemesters,
    availableYears,
    filteredTimetables,
    allSlots,
    clashes,
    groupedSlots,
    displayDays,
    displayTimes,
    hasClash,
    getClashDetails,
  };
};
