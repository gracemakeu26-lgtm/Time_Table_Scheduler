import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/layout/Footer';
import { getFromStorage } from '../utils/storage';
import {
  authAPI,
  timetablesAPI,
  departmentsAPI,
  slotsAPI,
  coursesAPI,
  roomsAPI,
  teachersAPI,
  levelsAPI,
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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [timetables, setTimetables] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTimetableId, setSelectedTimetableId] = useState(null);
  const [slots, setSlots] = useState([]);
  const [newSlot, setNewSlot] = useState({
    day_of_week: '',
    start_time: '',
    end_time: '',
    course_id: '',
    room_id: '',
    teacher_id: '',
  });
  const [levels, setLevels] = useState([]);
  const [courses, setCourses] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddDepartmentForm, setShowAddDepartmentForm] = useState(false);
  const [newTimetable, setNewTimetable] = useState({
    name: '',
    department_id: '',
    level_id: '',
    week_start: '',
    academic_year: '',
    semester: '',
    status: 'draft',
  });
  const [newDepartment, setNewDepartment] = useState({
    name: '',
    code: '',
    head: '',
    contact_email: '',
  });

  const [editingTimetableId, setEditingTimetableId] = useState(null);
  const [editingDepartmentId, setEditingDepartmentId] = useState(null);
  const [editTimetableData, setEditTimetableData] = useState({});
  const [editDepartmentData, setEditDepartmentData] = useState({});

  // Timetable View Filters
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedDepartmentView, setSelectedDepartmentView] = useState('');
  const [selectedLevelView, setSelectedLevelView] = useState('');
  const [viewMode, setViewMode] = useState('level'); // 'level', 'department', 'room'
  const [timetablesWithSlots, setTimetablesWithSlots] = useState([]);
  const [loadingTimetablesWithSlots, setLoadingTimetablesWithSlots] =
    useState(false);

  // Check authentication on mount
  useEffect(() => {
    const token = getFromStorage('auth_token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch essential data first (fast - without slots)
  useEffect(() => {
    const fetchEssentialData = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch essential data in parallel (without slots - much faster)
        const [
          timetablesData,
          departmentsData,
          levelsData,
          coursesData,
          roomsData,
          teachersData,
        ] = await Promise.all([
          timetablesAPI.getAll({ include_slots: false }),
          departmentsAPI.getAll(),
          levelsAPI.getAll({ active_only: true }),
          coursesAPI.getAll(),
          roomsAPI.getAll(),
          teachersAPI.getAll(),
        ]);

        // Set timetables without slots
        setTimetables(
          Array.isArray(timetablesData)
            ? timetablesData
            : timetablesData.data || [],
        );

        // Set departments
        setDepartments(
          Array.isArray(departmentsData)
            ? departmentsData
            : departmentsData.data || [],
        );

        // Set levels, courses, rooms, teachers
        setLevels(
          Array.isArray(levelsData) ? levelsData : levelsData.data || [],
        );
        setCourses(
          Array.isArray(coursesData) ? coursesData : coursesData.data || [],
        );
        setRooms(Array.isArray(roomsData) ? roomsData : roomsData.data || []);
        setTeachers(
          Array.isArray(teachersData) ? teachersData : teachersData.data || [],
        );
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEssentialData();
  }, []); // Empty dependency array - fetch only once on mount

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

  // Timetable Functions
  const handleAddTimetable = async () => {
    if (
      !newTimetable.name ||
      !newTimetable.department_id ||
      !newTimetable.week_start
    ) {
      setError('Name, Department, and Week Start are required');
      return;
    }

    try {
      await timetablesAPI.create(newTimetable);
      setNewTimetable({
        name: '',
        department_id: '',
        level_id: '',
        week_start: '',
        academic_year: '',
        semester: '',
        status: 'draft',
      });
      setShowAddForm(false);
      // Refresh timetables
      const timetablesData = await timetablesAPI.getAll({
        include_slots: false,
      });
      setTimetables(
        Array.isArray(timetablesData)
          ? timetablesData
          : timetablesData.data || [],
      );
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create timetable');
    }
  };

  // Slots Functions
  const loadSlots = async (timetableId) => {
    try {
      const data = await slotsAPI.getAll(timetableId);
      const arr = Array.isArray(data?.slots)
        ? data.slots
        : Array.isArray(data)
        ? data
        : [];
      setSlots(arr);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load slots');
    }
  };

  const handleSelectTimetable = async (id) => {
    setSelectedTimetableId(id);
    await loadSlots(id);
  };

  const handleAddSlot = async () => {
    if (
      !selectedTimetableId ||
      !newSlot.day_of_week ||
      !newSlot.start_time ||
      !newSlot.end_time ||
      !newSlot.course_id
    ) {
      setError('Timetable, Day, Start, End and Course are required');
      return;
    }
    try {
      await slotsAPI.create(selectedTimetableId, newSlot);
      setNewSlot({
        day_of_week: '',
        start_time: '',
        end_time: '',
        course_id: '',
        room_id: '',
        teacher_id: '',
      });
      await loadSlots(selectedTimetableId);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create slot');
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm('Delete this slot?')) return;
    try {
      await slotsAPI.delete(selectedTimetableId, slotId);
      await loadSlots(selectedTimetableId);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete slot');
    }
  };

  const handleDeleteTimetable = async (id) => {
    if (!window.confirm('Are you sure you want to delete this timetable?'))
      return;

    try {
      await timetablesAPI.delete(id);
      setTimetables(timetables.filter((t) => t.id !== id));
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete timetable');
    }
  };

  const handleEditTimetable = (id) => {
    const timetable = timetables.find((t) => t.id === id);
    setEditingTimetableId(id);
    setEditTimetableData({ ...timetable });
  };

  const handleSaveEditTimetable = async () => {
    if (!editTimetableData.name) {
      setError('Name is required');
      return;
    }

    try {
      await timetablesAPI.update(editingTimetableId, editTimetableData);
      setEditingTimetableId(null);
      setEditTimetableData({});
      // Refresh timetables
      const timetablesData = await timetablesAPI.getAll({
        include_slots: false,
      });
      setTimetables(
        Array.isArray(timetablesData)
          ? timetablesData
          : timetablesData.data || [],
      );
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update timetable');
    }
  };

  const handleCancelEditTimetable = () => {
    setEditingTimetableId(null);
    setEditTimetableData({});
  };

  // Department Functions
  const handleAddDepartment = async () => {
    if (!newDepartment.name) {
      setError('Department name is required');
      return;
    }

    try {
      await departmentsAPI.create(newDepartment);
      setNewDepartment({ name: '', code: '', head: '', contact_email: '' });
      setShowAddDepartmentForm(false);
      // Refresh departments
      const departmentsData = await departmentsAPI.getAll();
      setDepartments(
        Array.isArray(departmentsData)
          ? departmentsData
          : departmentsData.data || [],
      );
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create department');
    }
  };

  const handleDeleteDepartment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department?'))
      return;

    try {
      await departmentsAPI.delete(id);
      setDepartments(departments.filter((d) => d.id !== id));
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete department');
    }
  };

  const handleEditDepartment = (id) => {
    const department = departments.find((d) => d.id === id);
    setEditingDepartmentId(id);
    setEditDepartmentData({ ...department });
  };

  const handleSaveEditDepartment = async () => {
    if (!editDepartmentData.name) {
      setError('Department name is required');
      return;
    }

    try {
      await departmentsAPI.update(editingDepartmentId, editDepartmentData);
      setEditingDepartmentId(null);
      setEditDepartmentData({});
      // Refresh departments
      const departmentsData = await departmentsAPI.getAll();
      setDepartments(
        Array.isArray(departmentsData)
          ? departmentsData
          : departmentsData.data || [],
      );
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update department');
    }
  };

  const handleCancelEditDepartment = () => {
    setEditingDepartmentId(null);
    setEditDepartmentData({});
  };

  const handleLogout = () => {
    authAPI.logout();
    navigate('/login');
  };

  // Calculate stats
  const stats = {
    departments: departments.length,
    timetables: timetables.length,
    publishedTimetables: timetables.filter((t) => t.status === 'published')
      .length,
    draftTimetables: timetables.filter((t) => t.status === 'draft').length,
  };

  // Timetable View Logic
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
    if (!allSlots || allSlots.length === 0) return [];
    const clashList = [];
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

    roomDaySlots.forEach((slots) => {
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

  return (
    <div className='min-h-screen bg-linear-to-br from-gray-50 via-gray-100 to-gray-200 flex flex-col'>
      <div className='min-h-screen flex flex-col items-center'>
        <main className='grow w-full'>
          {/* Dashboard Header */}
          <div className='shadow-2xl w-full bg-white rounded-xs border-b border-gray-200'>
            <div className='emakeu26-lgtmmax-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
              <div className='flex justify-between items-center'>
                <div>
                  <h1 className='pt-3 text-3xl font-bold text-gray-900'>
                    Administration Dashboard
                  </h1>
                  <p className='text-gray-600 text-sm mt-1'>
                    Manage timetables and schedules
                  </p>
                </div>
                <div className='flex items-center gap-4'>
                  <button
                    onClick={handleLogout}
                    className='bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition text-sm font-medium'
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

          {/* Navigation Tabs */}
          <div className='sticky top-0 z-40 shadow-lg w-full bg-white border-b border-gray-200'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-2'>
              <nav className='flex gap-12 text-sm font-medium bg-white'>
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-4 border-b-2 transition ${
                    activeTab === 'overview'
                      ? 'border-gray-900 text-gray-900 font-semibold'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:-translate-y-1'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('timetables')}
                  className={`py-4 border-b-2 transition ${
                    activeTab === 'timetables'
                      ? 'border-gray-900 text-gray-900 font-semibold'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:-translate-y-1'
                  }`}
                >
                  Timetables
                </button>
                <button
                  onClick={() => setActiveTab('faculty')}
                  className={`py-4 border-b-2 transition ${
                    activeTab === 'faculty'
                      ? 'border-gray-900 text-gray-900 font-semibold'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:-translate-y-1'
                  }`}
                >
                  Departments
                </button>
                <button
                  onClick={() => setActiveTab('timetable-view')}
                  className={`py-4 border-b-2 transition ${
                    activeTab === 'timetable-view'
                      ? 'border-gray-900 text-gray-900 font-semibold'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:-translate-y-1'
                  }`}
                >
                  Timetable View
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`py-4 border-b-2 transition ${
                    activeTab === 'settings'
                      ? 'border-gray-900 text-gray-900 font-semibold'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:-translate-y-1'
                  }`}
                >
                  Settings
                </button>
              </nav>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4'>
              <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>
                {error}
              </div>
            </div>
          )}

          {/* Content Area */}
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
            {loading ? (
              <div className='text-center py-12'>
                <p className='text-gray-600'>Loading...</p>
              </div>
            ) : (
              <>
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div>
                    <h2 className='text-xl font-bold text-gray-900 mb-6'>
                      Dashboard Overview
                    </h2>

                    {/* Stats Cards */}
                    <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8'>
                      <div className='bg-white rounded-md border border-gray-200 p-6'>
                        <div className='text-sm text-gray-600 font-medium mb-2'>
                          Total Departments
                        </div>
                        <div className='text-3xl font-bold text-blue-600'>
                          {stats.departments}
                        </div>
                        <div className='text-xs text-gray-500 mt-2'>
                          Active departments
                        </div>
                      </div>
                      <div className='bg-white rounded-md border border-gray-200 p-6'>
                        <div className='text-sm text-gray-600 font-medium mb-2'>
                          Total Timetables
                        </div>
                        <div className='text-3xl font-bold text-blue-600'>
                          {stats.timetables}
                        </div>
                        <div className='text-xs text-gray-500 mt-2'>
                          All timetables
                        </div>
                      </div>
                      <div className='bg-white rounded-md border border-gray-200 p-6'>
                        <div className='text-sm text-gray-600 font-medium mb-2'>
                          Published
                        </div>
                        <div className='text-3xl font-bold text-green-600'>
                          {stats.publishedTimetables}
                        </div>
                        <div className='text-xs text-gray-500 mt-2'>
                          Published timetables
                        </div>
                      </div>
                      <div className='bg-white rounded-md border border-gray-200 p-6'>
                        <div className='text-sm text-gray-600 font-medium mb-2'>
                          Drafts
                        </div>
                        <div className='text-3xl font-bold text-yellow-600'>
                          {stats.draftTimetables}
                        </div>
                        <div className='text-xs text-gray-500 mt-2'>
                          Draft timetables
                        </div>
                      </div>
                    </div>

                    {/* Recent Timetables */}
                    <div className='bg-white/10 backdrop-blur-3xl rounded-md p-6'>
                      <h3 className='text-lg font-bold text-gray-900 mb-4'>
                        Recent Timetables
                      </h3>
                      {timetables.length === 0 ? (
                        <p className='text-gray-400'>No timetables yet</p>
                      ) : (
                        <div className='divide-y'>
                          {timetables.slice(0, 5).map((item) => (
                            <div
                              key={item.id}
                              className='py-4 flex justify-between items-center'
                            >
                              <div>
                                <div className='font-medium text-gray-900'>
                                  {item.name}
                                </div>
                                <div className='text-xs text-gray-200'>
                                  {item.academic_year || 'N/A'} -{' '}
                                  {item.semester || 'N/A'}
                                </div>
                              </div>
                              <span
                                className={`text-xs px-2 py-1 rounded ${
                                  item.status === 'published'
                                    ? 'bg-green-100 text-green-700'
                                    : item.status === 'draft'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {item.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Timetables Tab */}
                {activeTab === 'timetables' && (
                  <div>
                    <div className='flex justify-between items-center mb-6'>
                      <h2 className='text-xl font-bold text-gray-900'>
                        Manage Timetables
                      </h2>
                      <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className='bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition text-sm font-medium'
                      >
                        {showAddForm ? 'Cancel' : 'Add New Timetable'}
                      </button>
                    </div>

                    {/* Add Form */}
                    {showAddForm && (
                      <div className='bg-white rounded-md border border-gray-200 p-6 mb-6'>
                        <h3 className='text-base font-semibold text-gray-900 mb-4'>
                          New Timetable
                        </h3>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                          <input
                            type='text'
                            placeholder='Name *'
                            value={newTimetable.name}
                            onChange={(e) =>
                              setNewTimetable({
                                ...newTimetable,
                                name: e.target.value,
                              })
                            }
                            className='px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-500'
                          />
                          <select
                            value={newTimetable.department_id}
                            onChange={(e) =>
                              setNewTimetable({
                                ...newTimetable,
                                department_id: e.target.value,
                              })
                            }
                            className='px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-500'
                          >
                            <option value=''>Select Department *</option>
                            {departments.map((dept) => (
                              <option key={dept.id} value={dept.id}>
                                {dept.name}
                              </option>
                            ))}
                          </select>
                          <select
                            value={newTimetable.level_id}
                            onChange={(e) =>
                              setNewTimetable({
                                ...newTimetable,
                                level_id: e.target.value,
                              })
                            }
                            className='px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-500'
                          >
                            <option value=''>Select Level</option>
                            {levels.map((lvl) => (
                              <option key={lvl.id} value={lvl.id}>
                                {lvl.name}
                              </option>
                            ))}
                          </select>
                          <input
                            type='date'
                            placeholder='Week Start *'
                            value={newTimetable.week_start}
                            onChange={(e) =>
                              setNewTimetable({
                                ...newTimetable,
                                week_start: e.target.value,
                              })
                            }
                            className='px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-500'
                          />
                          <input
                            type='text'
                            placeholder='Academic Year'
                            value={newTimetable.academic_year}
                            onChange={(e) =>
                              setNewTimetable({
                                ...newTimetable,
                                academic_year: e.target.value,
                              })
                            }
                            className='px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-500'
                          />
                          <input
                            type='text'
                            placeholder='Semester'
                            value={newTimetable.semester}
                            onChange={(e) =>
                              setNewTimetable({
                                ...newTimetable,
                                semester: e.target.value,
                              })
                            }
                            className='px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-500'
                          />
                          <select
                            value={newTimetable.status}
                            onChange={(e) =>
                              setNewTimetable({
                                ...newTimetable,
                                status: e.target.value,
                              })
                            }
                            className='px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-500'
                          >
                            <option value='draft'>Draft</option>
                            <option value='published'>Published</option>
                            <option value='archived'>Archived</option>
                          </select>
                        </div>
                        <button
                          onClick={handleAddTimetable}
                          className='mt-4 bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition text-sm font-medium'
                        >
                          Save
                        </button>
                      </div>
                    )}

                    {/* Table */}
                    <div className='bg-white/10 backdrop-blur-3xl rounded-md overflow-hidden'>
                      {timetables.length === 0 ? (
                        <div className='p-8 text-center text-gray-400'>
                          No timetables found
                        </div>
                      ) : (
                        <table className='w-full'>
                          <thead className='bg-gray-50 border-b'>
                            <tr>
                              <th className='px-6 py-3 text-left text-sm font-semibold text-gray-900'>
                                Name
                              </th>
                              <th className='px-6 py-3 text-left text-sm font-semibold text-gray-900'>
                                Department
                              </th>
                              <th className='px-6 py-3 text-left text-sm font-semibold text-gray-900'>
                                Level
                              </th>
                              <th className='px-6 py-3 text-left text-sm font-semibold text-gray-900'>
                                Academic Year
                              </th>
                              <th className='px-6 py-3 text-left text-sm font-semibold text-gray-900'>
                                Status
                              </th>
                              <th className='px-6 py-3 text-left text-sm font-semibold text-gray-900'>
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className='divide-y'>
                            {timetables.map((item) => (
                              <tr key={item.id} className='hover:bg-gray-50'>
                                {editingTimetableId === item.id ? (
                                  <>
                                    <td className='px-6 py-4 text-sm'>
                                      <input
                                        type='text'
                                        value={editTimetableData.name || ''}
                                        onChange={(e) =>
                                          setEditTimetableData({
                                            ...editTimetableData,
                                            name: e.target.value,
                                          })
                                        }
                                        className='w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-500'
                                      />
                                    </td>
                                    <td className='px-6 py-4 text-sm'>
                                      <select
                                        value={
                                          editTimetableData.department_id || ''
                                        }
                                        onChange={(e) =>
                                          setEditTimetableData({
                                            ...editTimetableData,
                                            department_id: e.target.value,
                                          })
                                        }
                                        className='w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-500'
                                      >
                                        {departments.map((dept) => (
                                          <option key={dept.id} value={dept.id}>
                                            {dept.name}
                                          </option>
                                        ))}
                                      </select>
                                    </td>
                                    <td className='px-6 py-4 text-sm'>
                                      <select
                                        value={editTimetableData.level_id || ''}
                                        onChange={(e) =>
                                          setEditTimetableData({
                                            ...editTimetableData,
                                            level_id: e.target.value,
                                          })
                                        }
                                        className='w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-500'
                                      >
                                        <option value=''>None</option>
                                        {levels.map((lvl) => (
                                          <option key={lvl.id} value={lvl.id}>
                                            {lvl.name}
                                          </option>
                                        ))}
                                      </select>
                                    </td>
                                    <td className='px-6 py-4 text-sm'>
                                      <input
                                        type='text'
                                        value={
                                          editTimetableData.academic_year || ''
                                        }
                                        onChange={(e) =>
                                          setEditTimetableData({
                                            ...editTimetableData,
                                            academic_year: e.target.value,
                                          })
                                        }
                                        className='w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-500'
                                      />
                                    </td>
                                    <td className='px-6 py-4 text-sm'>
                                      <select
                                        value={
                                          editTimetableData.status || 'draft'
                                        }
                                        onChange={(e) =>
                                          setEditTimetableData({
                                            ...editTimetableData,
                                            status: e.target.value,
                                          })
                                        }
                                        className='w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-500'
                                      >
                                        <option value='draft'>Draft</option>
                                        <option value='published'>
                                          Published
                                        </option>
                                        <option value='archived'>
                                          Archived
                                        </option>
                                      </select>
                                    </td>
                                    <td className='px-6 py-4 text-sm space-x-2'>
                                      <button
                                        onClick={handleSaveEditTimetable}
                                        className='text-gray-900 hover:text-gray-700 text-sm font-medium'
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={handleCancelEditTimetable}
                                        className='text-gray-600 hover:text-gray-700 text-sm font-medium'
                                      >
                                        Cancel
                                      </button>
                                    </td>
                                  </>
                                ) : (
                                  <>
                                    <td className='px-6 py-4 text-sm text-gray-900 font-medium'>
                                      {item.name}
                                    </td>
                                    <td className='px-6 py-4 text-sm text-gray-400'>
                                      {departments.find(
                                        (d) => d.id === item.department_id,
                                      )?.name || 'N/A'}
                                    </td>
                                    <td className='px-6 py-4 text-sm text-gray-400'>
                                      {item.level_name ||
                                        levels.find(
                                          (l) => l.id === item.level_id,
                                        )?.name ||
                                        'N/A'}
                                    </td>
                                    <td className='px-6 py-4 text-sm text-gray-400'>
                                      {item.academic_year || 'N/A'}
                                    </td>
                                    <td className='px-6 py-4 text-sm'>
                                      <span
                                        className={`px-2 py-1 rounded text-xs ${
                                          item.status === 'published'
                                            ? 'bg-green-100 text-green-700'
                                            : item.status === 'draft'
                                            ? 'bg-yellow-100 text-yellow-700'
                                            : 'bg-gray-100 text-gray-700'
                                        }`}
                                      >
                                        {item.status}
                                      </span>
                                    </td>
                                    <td className='px-6 py-4 text-sm space-x-4'>
                                      <button
                                        onClick={() =>
                                          handleEditTimetable(item.id)
                                        }
                                        className='text-gray-900 hover:text-gray-700 text-sm font-medium'
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleSelectTimetable(item.id)
                                        }
                                        className={`text-sm font-medium ${
                                          selectedTimetableId === item.id
                                            ? 'text-green-600'
                                            : 'text-blue-600'
                                        } hover:text-gray-700`}
                                      >
                                        {selectedTimetableId === item.id
                                          ? 'Selected'
                                          : 'Manage Slots'}
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDeleteTimetable(item.id)
                                        }
                                        className='text-gray-400 hover:text-gray-700 text-sm font-medium'
                                      >
                                        Delete
                                      </button>
                                    </td>
                                  </>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>

                    {/* Slots Management Panel */}
                    {selectedTimetableId && (
                      <div className='mt-8 bg-white rounded-md border border-gray-200 p-6'>
                        <h3 className='text-base font-semibold text-gray-900 mb-4'>
                          Manage Slots for Timetable #{selectedTimetableId}
                        </h3>
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                          <select
                            value={newSlot.day_of_week}
                            onChange={(e) =>
                              setNewSlot({
                                ...newSlot,
                                day_of_week: e.target.value,
                              })
                            }
                            className='px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-500'
                          >
                            <option value=''>Day of Week *</option>
                            <option value='Monday'>Monday</option>
                            <option value='Tuesday'>Tuesday</option>
                            <option value='Wednesday'>Wednesday</option>
                            <option value='Thursday'>Thursday</option>
                            <option value='Friday'>Friday</option>
                            <option value='Saturday'>Saturday</option>
                          </select>
                          <input
                            type='time'
                            value={newSlot.start_time}
                            onChange={(e) =>
                              setNewSlot({
                                ...newSlot,
                                start_time: e.target.value,
                              })
                            }
                            placeholder='Start Time *'
                            className='px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-500'
                          />
                          <input
                            type='time'
                            value={newSlot.end_time}
                            onChange={(e) =>
                              setNewSlot({
                                ...newSlot,
                                end_time: e.target.value,
                              })
                            }
                            placeholder='End Time *'
                            className='px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-500'
                          />
                          <select
                            value={newSlot.course_id}
                            onChange={(e) =>
                              setNewSlot({
                                ...newSlot,
                                course_id: e.target.value,
                              })
                            }
                            className='px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-500'
                          >
                            <option value=''>Course *</option>
                            {courses.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.code} - {c.name}
                              </option>
                            ))}
                          </select>
                          <select
                            value={newSlot.room_id}
                            onChange={(e) =>
                              setNewSlot({
                                ...newSlot,
                                room_id: e.target.value,
                              })
                            }
                            className='px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-500'
                          >
                            <option value=''>Room</option>
                            {rooms.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.name || r.code || `Room ${r.id}`}
                              </option>
                            ))}
                          </select>
                          <select
                            value={newSlot.teacher_id}
                            onChange={(e) =>
                              setNewSlot({
                                ...newSlot,
                                teacher_id: e.target.value,
                              })
                            }
                            className='px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-500'
                          >
                            <option value=''>Teacher</option>
                            {teachers.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.name ||
                                  t.full_name ||
                                  `${t.first_name || ''} ${t.last_name || ''}`}
                              </option>
                            ))}
                          </select>
                        </div>
                        <button
                          onClick={handleAddSlot}
                          className='mt-4 bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition text-sm font-medium'
                        >
                          Add Slot
                        </button>

                        {/* Slots List */}
                        <div className='mt-6 bg-white/10 backdrop-blur-3xl rounded-md overflow-hidden'>
                          {slots.length === 0 ? (
                            <div className='p-6 text-center text-gray-400'>
                              No slots yet
                            </div>
                          ) : (
                            <table className='w-full'>
                              <thead className='bg-gray-50 border-b'>
                                <tr>
                                  <th className='px-6 py-3 text-left text-sm font-semibold text-gray-900'>
                                    Day
                                  </th>
                                  <th className='px-6 py-3 text-left text-sm font-semibold text-gray-900'>
                                    Time
                                  </th>
                                  <th className='px-6 py-3 text-left text-sm font-semibold text-gray-900'>
                                    Course
                                  </th>
                                  <th className='px-6 py-3 text-left text-sm font-semibold text-gray-900'>
                                    Room
                                  </th>
                                  <th className='px-6 py-3 text-left text-sm font-semibold text-gray-900'>
                                    Teacher
                                  </th>
                                  <th className='px-6 py-3 text-left text-sm font-semibold text-gray-900'>
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody className='divide-y'>
                                {slots.map((s) => (
                                  <tr key={s.id} className='hover:bg-gray-50'>
                                    <td className='px-6 py-4 text-sm text-gray-900 font-medium'>
                                      {s.day_of_week}
                                    </td>
                                    <td className='px-6 py-4 text-sm text-gray-600'>
                                      {s.start_time} - {s.end_time}
                                    </td>
                                    <td className='px-6 py-4 text-sm text-gray-600'>
                                      {s.course?.code} - {s.course?.name}
                                    </td>
                                    <td className='px-6 py-4 text-sm text-gray-600'>
                                      {s.room?.name || s.room?.code || 'N/A'}
                                    </td>
                                    <td className='px-6 py-4 text-sm text-gray-600'>
                                      {s.teacher?.name ||
                                        s.teacher?.full_name ||
                                        'N/A'}
                                    </td>
                                    <td className='px-6 py-4 text-sm space-x-4'>
                                      <button className='text-gray-900 hover:text-gray-700 text-sm font-medium'>
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => handleDeleteSlot(s.id)}
                                        className='text-gray-400 hover:text-gray-700 text-sm font-medium'
                                      >
                                        Delete
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Departments Tab */}
                {activeTab === 'faculty' && (
                  <div>
                    <div className='flex justify-between items-center mb-6'>
                      <h2 className='text-xl font-bold text-gray-900'>
                        Departments
                      </h2>
                      <button
                        onClick={() =>
                          setShowAddDepartmentForm(!showAddDepartmentForm)
                        }
                        className='bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition text-sm font-medium'
                      >
                        {showAddDepartmentForm ? 'Cancel' : 'Add Department'}
                      </button>
                    </div>

                    {/* Add Department Form */}
                    {showAddDepartmentForm && (
                      <div className='bg-white rounded-md border border-gray-200 p-6 mb-6'>
                        <h3 className='text-base font-semibold text-gray-900 mb-4'>
                          New Department
                        </h3>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                          <input
                            type='text'
                            placeholder='Department Name *'
                            value={newDepartment.name}
                            onChange={(e) =>
                              setNewDepartment({
                                ...newDepartment,
                                name: e.target.value,
                              })
                            }
                            className='px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-500'
                          />
                          <input
                            type='text'
                            placeholder='Code'
                            value={newDepartment.code}
                            onChange={(e) =>
                              setNewDepartment({
                                ...newDepartment,
                                code: e.target.value,
                              })
                            }
                            className='px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-500'
                          />
                          <input
                            type='text'
                            placeholder='Head'
                            value={newDepartment.head}
                            onChange={(e) =>
                              setNewDepartment({
                                ...newDepartment,
                                head: e.target.value,
                              })
                            }
                            className='px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-500'
                          />
                          <input
                            type='email'
                            placeholder='Contact Email'
                            value={newDepartment.contact_email}
                            onChange={(e) =>
                              setNewDepartment({
                                ...newDepartment,
                                contact_email: e.target.value,
                              })
                            }
                            className='px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-500'
                          />
                        </div>
                        <button
                          onClick={handleAddDepartment}
                          className='mt-4 bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition text-sm font-medium'
                        >
                          Save
                        </button>
                      </div>
                    )}

                    {/* Departments Table */}
                    <div className='bg-white/10 backdrop-blur-3xl rounded-md overflow-hidden'>
                      {departments.length === 0 ? (
                        <div className='p-8 text-center text-gray-400'>
                          No departments found
                        </div>
                      ) : (
                        <table className='w-full'>
                          <thead className='bg-gray-50 border-b'>
                            <tr>
                              <th className='px-6 py-3 text-left text-sm font-semibold text-gray-900'>
                                Name
                              </th>
                              <th className='px-6 py-3 text-left text-sm font-semibold text-gray-900'>
                                Code
                              </th>
                              <th className='px-6 py-3 text-left text-sm font-semibold text-gray-900'>
                                Head
                              </th>
                              <th className='px-6 py-3 text-left text-sm font-semibold text-gray-900'>
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className='divide-y'>
                            {departments.map((item) => (
                              <tr key={item.id} className='hover:bg-gray-50'>
                                {editingDepartmentId === item.id ? (
                                  <>
                                    <td className='px-6 py-4 text-sm'>
                                      <input
                                        type='text'
                                        value={editDepartmentData.name || ''}
                                        onChange={(e) =>
                                          setEditDepartmentData({
                                            ...editDepartmentData,
                                            name: e.target.value,
                                          })
                                        }
                                        className='w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-500'
                                      />
                                    </td>
                                    <td className='px-6 py-4 text-sm'>
                                      <input
                                        type='text'
                                        value={editDepartmentData.code || ''}
                                        onChange={(e) =>
                                          setEditDepartmentData({
                                            ...editDepartmentData,
                                            code: e.target.value,
                                          })
                                        }
                                        className='w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-500'
                                      />
                                    </td>
                                    <td className='px-6 py-4 text-sm'>
                                      <input
                                        type='text'
                                        value={editDepartmentData.head || ''}
                                        onChange={(e) =>
                                          setEditDepartmentData({
                                            ...editDepartmentData,
                                            head: e.target.value,
                                          })
                                        }
                                        className='w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-500'
                                      />
                                    </td>
                                    <td className='px-6 py-4 text-sm space-x-2'>
                                      <button
                                        onClick={handleSaveEditDepartment}
                                        className='text-gray-900 hover:text-gray-700 text-sm font-medium'
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={handleCancelEditDepartment}
                                        className='text-gray-600 hover:text-gray-700 text-sm font-medium'
                                      >
                                        Cancel
                                      </button>
                                    </td>
                                  </>
                                ) : (
                                  <>
                                    <td className='px-6 py-4 text-sm text-gray-900 font-medium'>
                                      {item.name}
                                    </td>
                                    <td className='px-6 py-4 text-sm text-gray-400'>
                                      {item.code || 'N/A'}
                                    </td>
                                    <td className='px-6 py-4 text-sm text-gray-400'>
                                      {item.head || 'N/A'}
                                    </td>
                                    <td className='px-6 py-4 text-sm space-x-4'>
                                      <button
                                        onClick={() =>
                                          handleEditDepartment(item.id)
                                        }
                                        className='text-gray-900 hover:text-gray-700 text-sm font-medium'
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDeleteDepartment(item.id)
                                        }
                                        className='text-gray-400 hover:text-gray-700 text-sm font-medium'
                                      >
                                        Delete
                                      </button>
                                    </td>
                                  </>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                )}

                {/* Timetable View Tab */}
                {activeTab === 'timetable-view' && (
                  <div>
                    <h2 className='text-xl font-bold text-gray-900 mb-6'>
                      Timetable View - Clash Detection
                    </h2>

                    {/* Filters */}
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 p-4 bg-gray-50 rounded-lg'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Semester
                        </label>
                        <select
                          value={selectedSemester}
                          onChange={(e) => setSelectedSemester(e.target.value)}
                          className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-900'
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
                          className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-900'
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
                          value={selectedDepartmentView}
                          onChange={(e) =>
                            setSelectedDepartmentView(e.target.value)
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-900'
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
                          value={selectedLevelView}
                          onChange={(e) => setSelectedLevelView(e.target.value)}
                          className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-900'
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
                          className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-900'
                        >
                          <option value='level'>By Level</option>
                          <option value='department'>By Department</option>
                          <option value='room'>By Room</option>
                        </select>
                      </div>
                    </div>

                    {/* Clash Summary */}
                    {clashes.length > 0 && (
                      <div className='mb-6 p-6 bg-red-50 border-2 border-red-300 rounded-lg'>
                        <h3 className='text-xl font-bold text-red-800 mb-4'>
                          Clashes Detected: {clashes.length}
                        </h3>
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
                                  {clash.type === 'room'
                                    ? 'Room Clash'
                                    : 'Teacher Clash'}
                                </div>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                                  <div className='bg-blue-50 p-3 rounded border border-blue-200'>
                                    <div className='font-semibold text-blue-800 mb-2'>
                                      Slot 1:
                                    </div>
                                    <div className='space-y-1 text-gray-700'>
                                      <div>
                                        <span className='font-medium'>
                                          Course:
                                        </span>{' '}
                                        {clash.course1} ({clash.course_code1})
                                      </div>
                                      <div>
                                        <span className='font-medium'>
                                          Department:
                                        </span>{' '}
                                        {clash.department1}
                                      </div>
                                      <div>
                                        <span className='font-medium'>
                                          Level:
                                        </span>{' '}
                                        {clash.level1}
                                      </div>
                                      <div>
                                        <span className='font-medium'>
                                          Teacher:
                                        </span>{' '}
                                        {clash.teacher1}
                                      </div>
                                      {clash.type === 'room' && (
                                        <div>
                                          <span className='font-medium'>
                                            Room:
                                          </span>{' '}
                                          {clash.room_name}
                                        </div>
                                      )}
                                      {clash.type === 'teacher' && (
                                        <div>
                                          <span className='font-medium'>
                                            Room:
                                          </span>{' '}
                                          {clash.room1}
                                        </div>
                                      )}
                                      <div>
                                        <span className='font-medium'>
                                          Time:
                                        </span>{' '}
                                        {clash.time_slot1}
                                      </div>
                                      <div>
                                        <span className='font-medium'>
                                          Day:
                                        </span>{' '}
                                        {clash.day}
                                      </div>
                                    </div>
                                  </div>
                                  <div className='bg-red-50 p-3 rounded border border-red-200'>
                                    <div className='font-semibold text-red-800 mb-2'>
                                      Slot 2:
                                    </div>
                                    <div className='space-y-1 text-gray-700'>
                                      <div>
                                        <span className='font-medium'>
                                          Course:
                                        </span>{' '}
                                        {clash.course2} ({clash.course_code2})
                                      </div>
                                      <div>
                                        <span className='font-medium'>
                                          Department:
                                        </span>{' '}
                                        {clash.department2}
                                      </div>
                                      <div>
                                        <span className='font-medium'>
                                          Level:
                                        </span>{' '}
                                        {clash.level2}
                                      </div>
                                      <div>
                                        <span className='font-medium'>
                                          Teacher:
                                        </span>{' '}
                                        {clash.teacher2}
                                      </div>
                                      {clash.type === 'room' && (
                                        <div>
                                          <span className='font-medium'>
                                            Room:
                                          </span>{' '}
                                          {clash.room_name}
                                        </div>
                                      )}
                                      {clash.type === 'teacher' && (
                                        <div>
                                          <span className='font-medium'>
                                            Room:
                                          </span>{' '}
                                          {clash.room2}
                                        </div>
                                      )}
                                      <div>
                                        <span className='font-medium'>
                                          Time:
                                        </span>{' '}
                                        {clash.time_slot2}
                                      </div>
                                      <div>
                                        <span className='font-medium'>
                                          Day:
                                        </span>{' '}
                                        {clash.day}
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
                        <div className='text-sm text-red-600 font-medium'>
                          Clashes
                        </div>
                        <div className='text-2xl font-bold text-red-900'>
                          {clashes.length}
                        </div>
                      </div>
                      <div className='bg-purple-50 p-4 rounded-lg border border-purple-200'>
                        <div className='text-sm text-purple-600 font-medium'>
                          Groups
                        </div>
                        <div className='text-2xl font-bold text-purple-900'>
                          {groupedSlots.size}
                        </div>
                      </div>
                    </div>

                    {/* Grouped Timetable View */}
                    <div className='space-y-8'>
                      {Array.from(groupedSlots.entries()).map(
                        ([groupName, slots], groupIdx) => {
                          const groupKey = `${viewMode}-${groupName}-${groupIdx}`;
                          return (
                            <div
                              key={groupKey}
                              className='border border-gray-200 rounded-lg p-4 bg-white'
                            >
                              <h3 className='text-xl font-bold text-gray-900 mb-4'>
                                {viewMode === 'level' && 'Level: '}
                                {viewMode === 'department' && 'Department: '}
                                {viewMode === 'room' && 'Room: '}
                                {groupName}
                              </h3>

                              {/* Timetable Grid */}
                              <div className='overflow-x-auto'>
                                <table className='min-w-full border-collapse border border-gray-300'>
                                  <thead>
                                    <tr className='bg-gray-900 text-white'>
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
                                          const dayTimeSlots = slots.filter(
                                            (s) =>
                                              s.day_of_week === day &&
                                              formatTimeSlot(
                                                s.start_time,
                                                s.end_time,
                                              ) === timeSlot,
                                          );

                                          return (
                                            <td
                                              key={`cell-${day}-${dayIdx}-${timeSlot}-${timeIdx}`}
                                              className={`border border-gray-300 px-2 py-1 align-top ${
                                                dayTimeSlots.some((s) =>
                                                  hasClash(s),
                                                )
                                                  ? 'bg-red-100'
                                                  : 'bg-white'
                                              }`}
                                            >
                                              {dayTimeSlots.length > 0 ? (
                                                <div className='space-y-1'>
                                                  {dayTimeSlots.map(
                                                    (slot, slotIdx) => {
                                                      const clash =
                                                        hasClash(slot);
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
                                                                    if (
                                                                      c.type ===
                                                                      'room'
                                                                    ) {
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
                                                              slot.course
                                                                ?.name ||
                                                              'Unknown'}
                                                          </div>
                                                          {(slot.course_code ||
                                                            slot.course
                                                              ?.code) && (
                                                            <div className='text-xs text-gray-600'>
                                                              {slot.course_code ||
                                                                slot.course
                                                                  ?.code}
                                                            </div>
                                                          )}
                                                          <div className='text-xs text-gray-700'>
                                                            Teacher:{' '}
                                                            {slot.teacher_name ||
                                                              'TBA'}
                                                          </div>
                                                          <div className='text-xs text-green-700'>
                                                            Room:{' '}
                                                            {slot.room_name ||
                                                              'Unknown'}
                                                          </div>
                                                          {clash && (
                                                            <div className='text-xs font-bold text-red-700 mt-1 border-t border-red-300 pt-1'>
                                                              CLASH
                                                            </div>
                                                          )}
                                                        </div>
                                                      );
                                                    },
                                                  )}
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

                    {loadingTimetablesWithSlots &&
                    activeTab === 'timetable-view' ? (
                      <div className='text-center py-12 text-gray-600'>
                        Loading timetables...
                      </div>
                    ) : groupedSlots.size === 0 &&
                      timetablesWithSlots.length > 0 ? (
                      <div className='text-center py-12 text-gray-500'>
                        No slots found for the selected filters.
                      </div>
                    ) : groupedSlots.size === 0 &&
                      timetablesWithSlots.length === 0 &&
                      !loadingTimetablesWithSlots ? (
                      <div className='text-center py-12 text-gray-500'>
                        No timetables available.
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                  <div>
                    <h2 className='text-xl font-bold text-gray-900 mb-6'>
                      Settings
                    </h2>
                    <div className='bg-white rounded-md border border-gray-200 p-6'>
                      <p className='text-gray-600 text-sm'>
                        Settings feature coming soon
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default AdminDashboard;
