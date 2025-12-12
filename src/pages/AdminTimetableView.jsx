import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { getFromStorage } from '../utils/storage';
import {
  timetablesAPI,
  departmentsAPI,
  levelsAPI,
  roomsAPI,
} from '../utils/api';

// Map day numbers to day names
const DAY_MAP = {
  0: 'Monday',
  1: 'Tuesday',
  2: 'Wednesday',
  3: 'Thursday',
  4: 'Friday',
  5: 'Saturday',
  6: 'Sunday',
};

// Parse time string to minutes for sorting
const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + (minutes || 0);
};

// Format time slot
const formatTimeSlot = (startTime, endTime) => {
  if (typeof startTime === 'string' && typeof endTime === 'string') {
    return `${startTime} - ${endTime}`;
  }
  return `${startTime} - ${endTime}`;
};

const AdminTimetableView = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timetables, setTimetables] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [levels, setLevels] = useState([]);
  const [rooms, setRooms] = useState([]);

  // Filters
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [viewMode, setViewMode] = useState('level'); // 'level', 'department', 'room'

  // Check authentication
  useEffect(() => {
    const token = getFromStorage('auth_token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [timetablesData, departmentsData, levelsData, roomsData] =
          await Promise.all([
            timetablesAPI.getAll({ include_slots: true }),
            departmentsAPI.getAll(),
            levelsAPI.getAll({ active_only: true }),
            roomsAPI.getAll(),
          ]);

        setTimetables(
          Array.isArray(timetablesData)
            ? timetablesData
            : timetablesData.data || [],
        );
        setDepartments(
          Array.isArray(departmentsData)
            ? departmentsData
            : departmentsData.data || [],
        );
        setLevels(
          Array.isArray(levelsData) ? levelsData : levelsData.data || [],
        );
        setRooms(Array.isArray(roomsData) ? roomsData : roomsData.data || []);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get unique semesters and years from timetables
  const availableSemesters = useMemo(() => {
    if (!timetables || timetables.length === 0) return [];
    const semesters = new Set();
    timetables.forEach((tt) => {
      if (tt && tt.semester) semesters.add(tt.semester);
    });
    return Array.from(semesters).sort();
  }, [timetables]);

  const availableYears = useMemo(() => {
    if (!timetables || timetables.length === 0) return [];
    const years = new Set();
    timetables.forEach((tt) => {
      if (tt && tt.academic_year) years.add(tt.academic_year);
    });
    return Array.from(years).sort();
  }, [timetables]);

  // Filter timetables based on selected filters
  const filteredTimetables = useMemo(() => {
    if (!timetables || timetables.length === 0) return [];

    try {
      return timetables.filter((tt) => {
        if (!tt) return false;

        // Filter by semester
        if (selectedSemester && selectedSemester !== '') {
          if (!tt.semester || tt.semester !== selectedSemester) {
            return false;
          }
        }

        // Filter by academic year
        if (selectedYear && selectedYear !== '') {
          if (!tt.academic_year || tt.academic_year !== selectedYear) {
            return false;
          }
        }

        // Filter by department
        if (selectedDepartment && selectedDepartment !== '') {
          const deptId = parseInt(selectedDepartment, 10);
          if (
            isNaN(deptId) ||
            !tt.department_id ||
            tt.department_id !== deptId
          ) {
            return false;
          }
        }

        // Filter by level
        if (selectedLevel && selectedLevel !== '') {
          const levelId = parseInt(selectedLevel, 10);
          if (isNaN(levelId)) {
            return false;
          }
          // If timetable has no level_id and we're filtering by level, exclude it
          if (tt.level_id === null || tt.level_id === undefined) {
            return false;
          }
          // If timetable has level_id, it must match
          if (tt.level_id !== levelId) {
            return false;
          }
        }

        return true;
      });
    } catch (error) {
      console.error('Error filtering timetables:', error);
      return [];
    }
  }, [
    timetables,
    selectedSemester,
    selectedYear,
    selectedDepartment,
    selectedLevel,
  ]);

  // Collect all slots from filtered timetables
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

  // Detect clashes - comprehensive detection
  const clashes = useMemo(() => {
    if (!allSlots || allSlots.length === 0) return [];

    const clashList = [];

    // Group slots by room and day for room clash detection
    const roomDaySlots = new Map();
    allSlots.forEach((slot) => {
      if (
        !slot ||
        slot.room_id === null ||
        slot.room_id === undefined ||
        slot.day_of_week === null ||
        slot.day_of_week === undefined
      )
        return;

      const key = `${slot.room_id}-${slot.day_of_week}`;
      if (!roomDaySlots.has(key)) {
        roomDaySlots.set(key, []);
      }
      roomDaySlots.get(key).push(slot);
    });

    // Check for room clashes (overlapping times in same room/day)
    roomDaySlots.forEach((slots, key) => {
      for (let i = 0; i < slots.length; i++) {
        for (let j = i + 1; j < slots.length; j++) {
          const slot1 = slots[i];
          const slot2 = slots[j];

          if (
            !slot1 ||
            !slot2 ||
            !slot1.start_time ||
            !slot1.end_time ||
            !slot2.start_time ||
            !slot2.end_time
          )
            continue;

          const start1 = timeToMinutes(slot1.start_time);
          const end1 = timeToMinutes(slot1.end_time);
          const start2 = timeToMinutes(slot2.start_time);
          const end2 = timeToMinutes(slot2.end_time);

          // Check for time overlap
          if (start1 < end2 && end1 > start2) {
            clashList.push({
              type: 'room',
              slot1,
              slot2,
              room_name: slot1.room_name || 'Unknown Room',
              room_id: slot1.room_id,
              day: DAY_MAP[slot1.day_of_week],
              day_of_week: slot1.day_of_week,
              time_slot1: formatTimeSlot(slot1.start_time, slot1.end_time),
              time_slot2: formatTimeSlot(slot2.start_time, slot2.end_time),
              department1: slot1.department_name || 'Unknown Department',
              department2: slot2.department_name || 'Unknown Department',
              level1: slot1.level_name || slot1.level_code || 'Unknown Level',
              level2: slot2.level_name || slot2.level_code || 'Unknown Level',
              course1:
                slot1.course_name || slot1.course?.name || 'Unknown Course',
              course2:
                slot2.course_name || slot2.course?.name || 'Unknown Course',
              course_code1: slot1.course_code || slot1.course?.code || '',
              course_code2: slot2.course_code || slot2.course?.code || '',
              teacher1: slot1.teacher_name || 'TBA',
              teacher2: slot2.teacher_name || 'TBA',
              timetable1: slot1.timetable_name || 'Unknown Timetable',
              timetable2: slot2.timetable_name || 'Unknown Timetable',
              semester1: slot1.semester || 'Unknown',
              semester2: slot2.semester || 'Unknown',
              academic_year1: slot1.academic_year || 'Unknown',
              academic_year2: slot2.academic_year || 'Unknown',
            });
          }
        }
      }
    });

    // Group slots by teacher and day for teacher clash detection
    const teacherDaySlots = new Map();
    allSlots.forEach((slot) => {
      if (!slot || slot.day_of_week === null || slot.day_of_week === undefined)
        return;

      if (slot.teacher_id || slot.teacher_name) {
        const teacherId = slot.teacher_id || slot.teacher_name;
        if (!teacherId) return;

        const key = `${teacherId}-${slot.day_of_week}`;
        if (!teacherDaySlots.has(key)) {
          teacherDaySlots.set(key, []);
        }
        teacherDaySlots.get(key).push(slot);
      }
    });

    // Check for teacher clashes
    teacherDaySlots.forEach((slots) => {
      for (let i = 0; i < slots.length; i++) {
        for (let j = i + 1; j < slots.length; j++) {
          const slot1 = slots[i];
          const slot2 = slots[j];

          if (
            !slot1 ||
            !slot2 ||
            !slot1.start_time ||
            !slot1.end_time ||
            !slot2.start_time ||
            !slot2.end_time
          )
            continue;

          const start1 = timeToMinutes(slot1.start_time);
          const end1 = timeToMinutes(slot1.end_time);
          const start2 = timeToMinutes(slot2.start_time);
          const end2 = timeToMinutes(slot2.end_time);

          if (start1 < end2 && end1 > start2) {
            clashList.push({
              type: 'teacher',
              slot1,
              slot2,
              teacher_name: slot1.teacher_name || 'Unknown Teacher',
              teacher_id: slot1.teacher_id,
              day: DAY_MAP[slot1.day_of_week],
              day_of_week: slot1.day_of_week,
              time_slot1: formatTimeSlot(slot1.start_time, slot1.end_time),
              time_slot2: formatTimeSlot(slot2.start_time, slot2.end_time),
              department1: slot1.department_name || 'Unknown Department',
              department2: slot2.department_name || 'Unknown Department',
              level1: slot1.level_name || slot1.level_code || 'Unknown Level',
              level2: slot2.level_name || slot2.level_code || 'Unknown Level',
              course1:
                slot1.course_name || slot1.course?.name || 'Unknown Course',
              course2:
                slot2.course_name || slot2.course?.name || 'Unknown Course',
              course_code1: slot1.course_code || slot1.course?.code || '',
              course_code2: slot2.course_code || slot2.course?.code || '',
              room1: slot1.room_name || 'Unknown Room',
              room2: slot2.room_name || 'Unknown Room',
              timetable1: slot1.timetable_name || 'Unknown Timetable',
              timetable2: slot2.timetable_name || 'Unknown Timetable',
              semester1: slot1.semester || 'Unknown',
              semester2: slot2.semester || 'Unknown',
              academic_year1: slot1.academic_year || 'Unknown',
              academic_year2: slot2.academic_year || 'Unknown',
            });
          }
        }
      }
    });

    return clashList;
  }, [allSlots]);

  // Get slots grouped by view mode
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

    // Sort slots within each group by day and time
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

  // Check if a slot has a clash
  const hasClash = (slot) => {
    if (!slot || !slot.id || !clashes || clashes.length === 0) return false;
    return clashes.some(
      (clash) =>
        (clash.slot1 && clash.slot1.id === slot.id) ||
        (clash.slot2 && clash.slot2.id === slot.id),
    );
  };

  // Get clash details for a slot
  const getClashDetails = (slot) => {
    if (!slot || !slot.id || !clashes || clashes.length === 0) return [];
    return clashes.filter(
      (clash) =>
        (clash.slot1 && clash.slot1.id === slot.id) ||
        (clash.slot2 && clash.slot2.id === slot.id),
    );
  };

  // Get unique days from slots
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

  // Get unique time slots
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

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-100'>
        <Header />
        <div className='flex items-center justify-center min-h-[80vh]'>
          <p className='text-gray-600'>Loading timetable data...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-100'>
      <Header />
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 min-h-screen'>
        <div className='bg-white rounded-lg shadow-lg p-6'>
          <h1 className='text-3xl font-bold text-gray-900 mb-6'>
            Admin Timetable View - Clash Detection
          </h1>

          {/* Error Message */}
          {error && (
            <div className='mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-lg'>
              <div className='text-red-800 font-bold mb-2'>Error:</div>
              <div className='text-red-700'>{error}</div>
            </div>
          )}

          {/* Filters */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 p-4 bg-gray-50 rounded-lg'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Semester
              </label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500'
              >
                <option value=''>All Semesters</option>
                {availableSemesters.map((sem) => (
                  <option key={sem} value={sem}>
                    {sem}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Academic Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500'
              >
                <option value=''>All Years</option>
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Department
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500'
              >
                <option value=''>All Departments</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Level
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500'
              >
                <option value=''>All Levels</option>
                {levels.map((level) => (
                  <option key={level.id} value={level.id}>
                    {level.code} - {level.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                View Mode
              </label>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500'
              >
                <option value='level'>By Level</option>
                <option value='department'>By Department</option>
                <option value='room'>By Room</option>
              </select>
            </div>
          </div>

          {/* Clash Summary - Display ALL clashes */}
          {clashes.length > 0 && (
            <div className='mb-6 p-6 bg-red-50 border-2 border-red-300 rounded-lg'>
              <h2 className='text-xl font-bold text-red-800 mb-4'>
                Clashes Detected: {clashes.length}
              </h2>
              <div className='space-y-4 max-h-96 overflow-y-auto'>
                {clashes.map((clash, idx) => {
                  const clashKey =
                    clash.slot1?.id && clash.slot2?.id
                      ? `clash-${clash.type}-${clash.slot1.id}-${clash.slot2.id}`
                      : `clash-${clash.type}-${idx}-${Date.now()}`;
                  return (
                    <div
                      key={clashKey}
                      className='bg-white p-4 rounded-lg border border-red-300 shadow-sm'
                    >
                      <div className='font-bold text-red-700 mb-2'>
                        Clash #{idx + 1}:{' '}
                        {clash.type === 'room' ? 'Room Clash' : 'Teacher Clash'}
                      </div>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                        {/* Slot 1 Details */}
                        <div className='bg-blue-50 p-3 rounded border border-blue-200'>
                          <div className='font-semibold text-blue-800 mb-2'>
                            Slot 1:
                          </div>
                          <div className='space-y-1 text-gray-700'>
                            <div>
                              <span className='font-medium'>Course:</span>{' '}
                              {clash.course1} ({clash.course_code1})
                            </div>
                            <div>
                              <span className='font-medium'>Department:</span>{' '}
                              {clash.department1}
                            </div>
                            <div>
                              <span className='font-medium'>Level:</span>{' '}
                              {clash.level1}
                            </div>
                            <div>
                              <span className='font-medium'>Teacher:</span>{' '}
                              {clash.teacher1}
                            </div>
                            {clash.type === 'room' && (
                              <div>
                                <span className='font-medium'>Room:</span>{' '}
                                {clash.room_name}
                              </div>
                            )}
                            {clash.type === 'teacher' && (
                              <div>
                                <span className='font-medium'>Room:</span>{' '}
                                {clash.room1}
                              </div>
                            )}
                            <div>
                              <span className='font-medium'>Time:</span>{' '}
                              {clash.time_slot1}
                            </div>
                            <div>
                              <span className='font-medium'>Day:</span>{' '}
                              {clash.day}
                            </div>
                            <div>
                              <span className='font-medium'>Timetable:</span>{' '}
                              {clash.timetable1}
                            </div>
                            <div>
                              <span className='font-medium'>Semester:</span>{' '}
                              {clash.semester1} ({clash.academic_year1})
                            </div>
                          </div>
                        </div>

                        {/* Slot 2 Details */}
                        <div className='bg-red-50 p-3 rounded border border-red-200'>
                          <div className='font-semibold text-red-800 mb-2'>
                            Slot 2:
                          </div>
                          <div className='space-y-1 text-gray-700'>
                            <div>
                              <span className='font-medium'>Course:</span>{' '}
                              {clash.course2} ({clash.course_code2})
                            </div>
                            <div>
                              <span className='font-medium'>Department:</span>{' '}
                              {clash.department2}
                            </div>
                            <div>
                              <span className='font-medium'>Level:</span>{' '}
                              {clash.level2}
                            </div>
                            <div>
                              <span className='font-medium'>Teacher:</span>{' '}
                              {clash.teacher2}
                            </div>
                            {clash.type === 'room' && (
                              <div>
                                <span className='font-medium'>Room:</span>{' '}
                                {clash.room_name}
                              </div>
                            )}
                            {clash.type === 'teacher' && (
                              <div>
                                <span className='font-medium'>Room:</span>{' '}
                                {clash.room2}
                              </div>
                            )}
                            <div>
                              <span className='font-medium'>Time:</span>{' '}
                              {clash.time_slot2}
                            </div>
                            <div>
                              <span className='font-medium'>Day:</span>{' '}
                              {clash.day}
                            </div>
                            <div>
                              <span className='font-medium'>Timetable:</span>{' '}
                              {clash.timetable2}
                            </div>
                            <div>
                              <span className='font-medium'>Semester:</span>{' '}
                              {clash.semester2} ({clash.academic_year2})
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className='mt-3 pt-3 border-t border-gray-300'>
                        <div className='text-sm font-semibold text-red-800'>
                          Conflict Details:
                        </div>
                        <div className='text-sm text-gray-700'>
                          {clash.type === 'room'
                            ? `Both slots are scheduled in the same room (${clash.room_name}) on ${clash.day} with overlapping times: ${clash.time_slot1} and ${clash.time_slot2}`
                            : `Same teacher (${clash.teacher_name}) is scheduled for two different courses on ${clash.day} with overlapping times: ${clash.time_slot1} and ${clash.time_slot2}`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Statistics */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
            <div className='bg-blue-50 p-4 rounded-lg border border-blue-200'>
              <div className='text-sm text-blue-600 font-medium'>
                Total Timetables
              </div>
              <div className='text-2xl font-bold text-blue-900'>
                {filteredTimetables.length}
              </div>
            </div>
            <div className='bg-green-50 p-4 rounded-lg border border-green-200'>
              <div className='text-sm text-green-600 font-medium'>
                Total Slots
              </div>
              <div className='text-2xl font-bold text-green-900'>
                {allSlots.length}
              </div>
            </div>
            <div className='bg-red-50 p-4 rounded-lg border border-red-200'>
              <div className='text-sm text-red-600 font-medium'>Clashes</div>
              <div className='text-2xl font-bold text-red-900'>
                {clashes.length}
              </div>
            </div>
            <div className='bg-purple-50 p-4 rounded-lg border border-purple-200'>
              <div className='text-sm text-purple-600 font-medium'>Groups</div>
              <div className='text-2xl font-bold text-purple-900'>
                {groupedSlots.size}
              </div>
            </div>
          </div>

          {/* Grouped Timetable View */}
          <div className='space-y-8'>
            {Array.from(groupedSlots.entries()).map(
              ([groupName, slots], groupIdx) => {
                // Create a unique key for each group
                const groupKey = `${viewMode}-${groupName}-${groupIdx}`;
                return (
                  <div
                    key={groupKey}
                    className='border border-gray-200 rounded-lg p-4'
                  >
                    <h2 className='text-xl font-bold text-gray-900 mb-4'>
                      {viewMode === 'level' && 'Level: '}
                      {viewMode === 'department' && 'Department: '}
                      {viewMode === 'room' && 'Room: '}
                      {groupName}
                    </h2>

                    {/* Timetable Grid */}
                    <div className='overflow-x-auto'>
                      <table className='min-w-full border-collapse border border-gray-300'>
                        <thead>
                          <tr className='bg-blue-600 text-white'>
                            <th className='border border-gray-300 px-4 py-2 text-left'>
                              Time
                            </th>
                            {displayDays.map((day, dayIdx) => (
                              <th
                                key={`day-${day}-${dayIdx}`}
                                className='border border-gray-300 px-4 py-2 text-center'
                              >
                                {DAY_MAP[day]}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {displayTimes.map((timeSlot, timeIdx) => (
                            <tr key={`time-${timeSlot}-${timeIdx}`}>
                              <td className='border border-gray-300 px-4 py-2 font-semibold bg-gray-50'>
                                {timeSlot}
                              </td>
                              {displayDays.map((day, dayIdx) => {
                                // Find ALL slots for this day and time (not just one)
                                const dayTimeSlots = slots.filter(
                                  (s) =>
                                    s.day_of_week === day &&
                                    formatTimeSlot(s.start_time, s.end_time) ===
                                      timeSlot,
                                );

                                return (
                                  <td
                                    key={`cell-${day}-${dayIdx}-${timeSlot}-${timeIdx}`}
                                    className={`border border-gray-300 px-2 py-1 align-top ${
                                      dayTimeSlots.some((s) => hasClash(s))
                                        ? 'bg-red-100'
                                        : 'bg-white'
                                    }`}
                                  >
                                    {dayTimeSlots.length > 0 ? (
                                      <div className='space-y-1'>
                                        {dayTimeSlots.map((slot, slotIdx) => {
                                          const clash = hasClash(slot);
                                          // Create a unique key combining multiple identifiers
                                          const slotKey = slot.id
                                            ? `slot-${slot.id}-${day}-${timeSlot}`
                                            : `slot-${slotIdx}-${day}-${timeSlot}-${
                                                slot.course_id ||
                                                slot.course_code ||
                                                'unknown'
                                              }`;
                                          return (
                                            <div
                                              key={slotKey}
                                              className={`p-2 rounded text-xs ${
                                                clash
                                                  ? 'bg-red-200 border-2 border-red-500'
                                                  : 'bg-blue-50 border border-blue-200'
                                              }`}
                                              title={
                                                clash
                                                  ? `CLASH: ${getClashDetails(
                                                      slot,
                                                    )
                                                      .map((c) => {
                                                        if (c.type === 'room') {
                                                          return `Room clash in ${c.room_name}`;
                                                        }
                                                        return `Teacher clash: ${c.teacher_name}`;
                                                      })
                                                      .join(', ')}`
                                                  : ''
                                              }
                                            >
                                              <div className='font-semibold text-xs'>
                                                {slot.course_name ||
                                                  slot.course?.name ||
                                                  'Unknown'}
                                              </div>
                                              {(slot.course_code ||
                                                slot.course?.code) && (
                                                <div className='text-xs text-gray-600'>
                                                  {slot.course_code ||
                                                    slot.course?.code}
                                                </div>
                                              )}
                                              <div className='text-xs text-gray-700'>
                                                Teacher:{' '}
                                                {slot.teacher_name || 'TBA'}
                                              </div>
                                              <div className='text-xs text-green-700'>
                                                Room:{' '}
                                                {slot.room_name || 'Unknown'}
                                              </div>
                                              {slot.department_name && (
                                                <div className='text-xs text-purple-600'>
                                                  Dept: {slot.department_name}
                                                </div>
                                              )}
                                              {slot.level_name && (
                                                <div className='text-xs text-indigo-600'>
                                                  Level:{' '}
                                                  {slot.level_name ||
                                                    slot.level_code}
                                                </div>
                                              )}
                                              {clash && (
                                                <div className='text-xs font-bold text-red-700 mt-1 border-t border-red-300 pt-1'>
                                                  CLASH
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    ) : (
                                      <div className='text-gray-300 text-center text-xs'>
                                        -
                                      </div>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              },
            )}
          </div>

          {groupedSlots.size === 0 && (
            <div className='text-center py-12 text-gray-500'>
              No slots found for the selected filters.
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminTimetableView;
