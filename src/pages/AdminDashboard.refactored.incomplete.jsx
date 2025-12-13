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
  const [success, setSuccess] = useState('');
  const [selectedTimetableId, setSelectedTimetableId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    id: null,
    name: '',
    type: 'timetable', // 'timetable', 'department', or 'slot'
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slots, setSlots] = useState([]);
  const [newSlot, setNewSlot] = useState({
    day_of_week: '',
    start_time: '',
    end_time: '',
    course_id: '',
    room_id: '',
    teacher_id: '',
  });
  const [availableRooms, setAvailableRooms] = useState([]);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
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

  // Auto-dismiss success messages
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Auto-dismiss error messages
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Timetable Functions
  const handleAddTimetable = async () => {
    setError('');
    setSuccess('');

    // Validation
    if (!newTimetable.name?.trim()) {
      setError('Timetable name is required');
      return;
    }
    if (!newTimetable.department_id) {
      setError('Please select a department');
      return;
    }
    if (!newTimetable.week_start) {
      setError('Week start date is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await timetablesAPI.create(newTimetable);
      setSuccess(`Timetable "${newTimetable.name}" created successfully!`);
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
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'Failed to create timetable. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Slots Functions
  const loadSlots = async (timetableId) => {
    setLoadingSlots(true);
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
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSelectTimetable = async (id) => {
    setSelectedTimetableId(id);
    await loadSlots(id);
  };

  // Helper to convert day number to day name
  const dayNumberToName = (dayNum) => {
    if (typeof dayNum === 'string') return dayNum; // Already a name
    const dayMap = {
      0: 'Monday',
      1: 'Tuesday',
      2: 'Wednesday',
      3: 'Thursday',
      4: 'Friday',
      5: 'Saturday',
      6: 'Sunday',
    };
    return dayMap[dayNum] || '';
  };

  // Helper to convert day name to day number
  const dayNameToNumber = (dayName) => {
    const dayMap = {
      Monday: 0,
      Tuesday: 1,
      Wednesday: 2,
      Thursday: 3,
      Friday: 4,
      Saturday: 5,
      Sunday: 6,
    };
    return dayMap[dayName] !== undefined ? dayMap[dayName] : null;
  };

  // Check availability for rooms and teachers based on selected time
  const checkAvailability = async () => {
    if (
      !newSlot.day_of_week ||
      !newSlot.start_time ||
      !newSlot.end_time ||
      !selectedTimetableId
    ) {
      setAvailableRooms([]);
      setAvailableTeachers([]);
      return;
    }

    setCheckingAvailability(true);
    try {
      const dayNumber = dayNameToNumber(newSlot.day_of_week);
      if (dayNumber === null) {
        setAvailableRooms([]);
        setAvailableTeachers([]);
        setCheckingAvailability(false);
        return;
      }

      // Check room availability
      try {
        const roomAvailability = await roomsAPI.checkAvailability({
          day_of_week: dayNumber,
          start_time: newSlot.start_time,
          end_time: newSlot.end_time,
        });
        setAvailableRooms(
          roomAvailability.available_rooms || roomAvailability || [],
        );
      } catch (err) {
        console.error('Error checking room availability:', err);
        setAvailableRooms([]);
      }

      // Check teacher availability by getting all slots and filtering
      // Teachers are available if they don't have conflicting slots
      try {
        const selectedTimetable = timetables.find(
          (t) => String(t.id) === String(selectedTimetableId),
        );
        const levelId = selectedTimetable?.level_id
          ? Number(selectedTimetable.level_id)
          : null;

        // Get all slots for the same semester and academic year
        const allTimetablesData = await timetablesAPI.getAll({
          include_slots: true,
        });
        const allTimetables = Array.isArray(allTimetablesData)
          ? allTimetablesData
          : allTimetablesData.data || [];

        // Filter timetables by same semester and academic year
        const sameSemesterTimetables = allTimetables.filter((tt) => {
          return (
            tt.semester === selectedTimetable?.semester &&
            tt.academic_year === selectedTimetable?.academic_year
          );
        });

        // Get all conflicting slots
        const conflictingSlots = [];
        sameSemesterTimetables.forEach((tt) => {
          if (tt.slots && Array.isArray(tt.slots)) {
            tt.slots.forEach((slot) => {
              if (
                slot.day_of_week === dayNumber &&
                slot.start_time &&
                slot.end_time &&
                slot.teacher_id &&
                slot.id !== editingSlotId // Exclude current slot when editing
              ) {
                const slotStart = timeToMinutes(slot.start_time);
                const slotEnd = timeToMinutes(slot.end_time);
                const newStart = timeToMinutes(newSlot.start_time);
                const newEnd = timeToMinutes(newSlot.end_time);

                // Check for time overlap
                if (slotStart < newEnd && slotEnd > newStart) {
                  conflictingSlots.push(slot.teacher_id);
                }
              }
            });
          }
        });

        // Filter teachers who teach courses at this level and are available
        const levelTeachers = levelId
          ? teachers.filter((teacher) => {
              return courses.some(
                (c) =>
                  c.level_id &&
                  Number(c.level_id) === levelId &&
                  c.teacher_id &&
                  Number(c.teacher_id) === Number(teacher.id),
              );
            })
          : teachers;

        const available = levelTeachers.filter(
          (teacher) => !conflictingSlots.includes(Number(teacher.id)),
        );
        setAvailableTeachers(available);
      } catch (err) {
        console.error('Error checking teacher availability:', err);
        // Fallback: show all teachers for the level
        const selectedTimetable = timetables.find(
          (t) => String(t.id) === String(selectedTimetableId),
        );
        const levelId = selectedTimetable?.level_id
          ? Number(selectedTimetable.level_id)
          : null;
        const levelTeachers = levelId
          ? teachers.filter((teacher) => {
              return courses.some(
                (c) =>
                  c.level_id &&
                  Number(c.level_id) === levelId &&
                  c.teacher_id &&
                  Number(c.teacher_id) === Number(teacher.id),
              );
            })
          : teachers;
        setAvailableTeachers(levelTeachers);
      }
    } catch (err) {
      console.error('Error checking availability:', err);
    } finally {
      setCheckingAvailability(false);
    }
  };

  // Check availability when time/day changes
  useEffect(() => {
    if (showSlotModal && selectedTimetableId) {
      const timeoutId = setTimeout(() => {
        checkAvailability();
      }, 500); // Debounce for 500ms

      return () => clearTimeout(timeoutId);
    } else {
      setAvailableRooms([]);
      setAvailableTeachers([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    newSlot.day_of_week,
    newSlot.start_time,
    newSlot.end_time,
    showSlotModal,
    selectedTimetableId,
    editingSlotId,
  ]);

  const handleOpenSlotModal = (slot = null) => {
    if (slot) {
      // Edit mode
      setEditingSlotId(slot.id);
      setNewSlot({
        day_of_week: dayNumberToName(slot.day_of_week) || slot.day_name || '',
        start_time: slot.start_time || '',
        end_time: slot.end_time || '',
        course_id: slot.course_id || slot.course?.id || '',
        room_id: slot.room_id || slot.room?.id || '',
        teacher_id: slot.teacher_id || slot.teacher?.id || '',
      });
    } else {
      // Add mode
      setEditingSlotId(null);
      setNewSlot({
        day_of_week: '',
        start_time: '',
        end_time: '',
        course_id: '',
        room_id: '',
        teacher_id: '',
      });
    }
    setShowSlotModal(true);
    setError('');
    setSuccess('');
  };

  const handleCloseSlotModal = () => {
    setShowSlotModal(false);
    setEditingSlotId(null);
    setNewSlot({
      day_of_week: '',
      start_time: '',
      end_time: '',
      course_id: '',
      room_id: '',
      teacher_id: '',
    });
    setAvailableRooms([]);
    setAvailableTeachers([]);
    setCheckingAvailability(false);
    setError('');
  };

  const handleAddSlot = async () => {
    setError('');
    setSuccess('');

    // Validation
    if (!newSlot.day_of_week) {
      setError('Please select a day of the week');
      return;
    }
    if (!newSlot.start_time) {
      setError('Please select a start time');
      return;
    }
    if (!newSlot.end_time) {
      setError('Please select an end time');
      return;
    }
    if (newSlot.start_time >= newSlot.end_time) {
      setError('End time must be after start time');
      return;
    }
    if (!newSlot.course_id) {
      setError('Please select a course');
      return;
    }

    setIsSubmitting(true);
    try {
      // Check for conflicts before creating/updating
      if (newSlot.room_id || newSlot.teacher_id) {
        try {
          const dayNumber = dayNameToNumber(newSlot.day_of_week);
          const conflictData = {
            day_of_week: dayNumber !== null ? dayNumber : newSlot.day_of_week,
            start_time: newSlot.start_time,
            end_time: newSlot.end_time,
            room_id: newSlot.room_id || null,
            teacher_id: newSlot.teacher_id || null,
            exclude_slot_id: editingSlotId || null, // Exclude current slot when editing
          };
          const conflictCheck = await slotsAPI.checkConflicts(
            selectedTimetableId,
            conflictData,
          );

          if (conflictCheck && conflictCheck.has_conflicts) {
            let conflictMessage = '⚠️ Conflict detected: ';
            const conflicts = [];
            if (
              conflictCheck.room_conflicts &&
              conflictCheck.room_conflicts.length > 0
            ) {
              conflicts.push(
                `Room conflict: ${
                  conflictCheck.room_conflicts[0].room_name || 'Room'
                } is already booked at this time`,
              );
            }
            if (
              conflictCheck.teacher_conflicts &&
              conflictCheck.teacher_conflicts.length > 0
            ) {
              conflicts.push(
                `Teacher conflict: ${
                  conflictCheck.teacher_conflicts[0].teacher_name || 'Teacher'
                } is already scheduled at this time`,
              );
            }
            setError(conflictMessage + conflicts.join('. '));
            setIsSubmitting(false);
            return;
          }
        } catch (conflictErr) {
          // If conflict check fails, proceed anyway (backend will catch it)
          console.warn('Conflict check failed:', conflictErr);
        }
      }

      if (editingSlotId) {
        // Update existing slot
        await slotsAPI.update(selectedTimetableId, editingSlotId, newSlot);
        setSuccess('Slot updated successfully!');
      } else {
        // Create new slot
        await slotsAPI.create(selectedTimetableId, newSlot);
        setSuccess('Slot created successfully!');
      }
      handleCloseSlotModal();
      await loadSlots(selectedTimetableId);
    } catch (err) {
      // Check if error is about conflicts
      const errorMsg = err.response?.data?.error || '';
      if (
        errorMsg.toLowerCase().includes('conflict') ||
        errorMsg.toLowerCase().includes('clash') ||
        errorMsg.toLowerCase().includes('already')
      ) {
        setError(`⚠️ ${errorMsg}`);
      } else {
        setError(
          errorMsg ||
            `Failed to ${
              editingSlotId ? 'update' : 'create'
            } slot. Please try again.`,
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSlot = (slotId) => {
    const slot = slots.find((s) => s.id === slotId);
    const courseName = slot?.course?.name || slot?.course_name || 'this slot';
    setDeleteConfirm({
      isOpen: true,
      id: slotId,
      name: courseName,
      type: 'slot',
    });
  };

  const handleDeleteSlotConfirm = async () => {
    if (!deleteConfirm.id || deleteConfirm.type !== 'slot') return;

    setIsSubmitting(true);
    try {
      await slotsAPI.delete(selectedTimetableId, deleteConfirm.id);
      setSuccess('Slot deleted successfully!');
      await loadSlots(selectedTimetableId);
      setDeleteConfirm({
        isOpen: false,
        id: null,
        name: '',
        type: 'timetable',
      });
      setError('');
    } catch (err) {
      setError(
        err.response?.data?.error || 'Failed to delete slot. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTimetable = (id) => {
    const timetable = timetables.find((t) => t.id === id);
    setDeleteConfirm({
      isOpen: true,
      id,
      name: timetable?.name || 'this timetable',
      type: 'timetable',
    });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return;

    if (deleteConfirm.type === 'slot') {
      await handleDeleteSlotConfirm();
      return;
    }

    setIsSubmitting(true);
    try {
      if (deleteConfirm.type === 'timetable') {
        await timetablesAPI.delete(deleteConfirm.id);
        setTimetables(timetables.filter((t) => t.id !== deleteConfirm.id));
        setSuccess(`Timetable "${deleteConfirm.name}" deleted successfully!`);
        // Clear selection if deleted timetable was selected
        if (selectedTimetableId === deleteConfirm.id) {
          setSelectedTimetableId(null);
          setSlots([]);
        }
      } else if (deleteConfirm.type === 'department') {
        await departmentsAPI.delete(deleteConfirm.id);
        setDepartments(departments.filter((d) => d.id !== deleteConfirm.id));
        setSuccess(`Department "${deleteConfirm.name}" deleted successfully!`);
      }
      setDeleteConfirm({
        isOpen: false,
        id: null,
        name: '',
        type: 'timetable',
      });
      setError('');
    } catch (err) {
      setError(
        err.response?.data?.error ||
          `Failed to delete ${deleteConfirm.type}. Please try again.`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTimetable = (id) => {
    const timetable = timetables.find((t) => t.id === id);
    setEditingTimetableId(id);
    setEditTimetableData({ ...timetable });
    setShowEditModal(true);
    setError('');
    setSuccess('');
  };

  const handleSaveEditTimetable = async () => {
    setError('');
    setSuccess('');

    // Validation
    if (!editTimetableData.name?.trim()) {
      setError('Timetable name is required');
      return;
    }
    if (!editTimetableData.department_id) {
      setError('Please select a department');
      return;
    }
    if (!editTimetableData.week_start) {
      setError('Week start date is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await timetablesAPI.update(editingTimetableId, editTimetableData);
      setSuccess(`Timetable "${editTimetableData.name}" updated successfully!`);
      setEditingTimetableId(null);
      setEditTimetableData({});
      setShowEditModal(false);
      // Refresh timetables
      const timetablesData = await timetablesAPI.getAll({
        include_slots: false,
      });
      setTimetables(
        Array.isArray(timetablesData)
          ? timetablesData
          : timetablesData.data || [],
      );
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'Failed to update timetable. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEditTimetable = () => {
    setEditingTimetableId(null);
    setEditTimetableData({});
    setShowEditModal(false);
    setError('');
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

  const handleDeleteDepartment = (id) => {
    const department = departments.find((d) => d.id === id);
    setDeleteConfirm({
      isOpen: true,
      id,
      name: department?.name || 'this department',
      type: 'department',
    });
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
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
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

          {/* Success Message */}
          {success && (
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4'>
              <div className='bg-green-50 border border-green-400 text-green-800 px-4 py-3 rounded-lg flex items-center justify-between'>
                <div className='flex items-center'>
                  <span className='text-green-500 mr-2'>✓</span>
                  <span>{success}</span>
                </div>
                <button
                  onClick={() => setSuccess('')}
                  className='text-green-600 hover:text-green-800'
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4'>
              <div className='bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between'>
                <div className='flex items-center'>
                  <span className='text-red-500 mr-2'>⚠</span>
                  <span>{error}</span>
                </div>
                <button
                  onClick={() => setError('')}
                  className='text-red-600 hover:text-red-800'
                >
                  ×
                </button>
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
                      <div className='bg-white rounded-lg border border-gray-200 shadow-md p-6 mb-6'>
                        <div className='flex items-center justify-between mb-6'>
                          <h3 className='text-lg font-bold text-gray-900'>
                            Create New Timetable
                          </h3>
                          <button
                            onClick={() => {
                              setShowAddForm(false);
                              setNewTimetable({
                                name: '',
                                department_id: '',
                                level_id: '',
                                week_start: '',
                                academic_year: '',
                                semester: '',
                                status: 'draft',
                              });
                              setError('');
                            }}
                            className='text-gray-500 hover:text-gray-700'
                          >
                            ×
                          </button>
                        </div>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                          <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                              Timetable Name{' '}
                              <span className='text-red-500'>*</span>
                            </label>
                            <input
                              type='text'
                              placeholder='e.g., Fall 2024 - Computer Science'
                              value={newTimetable.name}
                              onChange={(e) =>
                                setNewTimetable({
                                  ...newTimetable,
                                  name: e.target.value,
                                })
                              }
                              className='w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent'
                            />
                          </div>
                          <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                              Department <span className='text-red-500'>*</span>
                            </label>
                            <select
                              value={newTimetable.department_id}
                              onChange={(e) =>
                                setNewTimetable({
                                  ...newTimetable,
                                  department_id: e.target.value,
                                })
                              }
                              className='w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent'
                            >
                              <option value=''>Select Department</option>
                              {departments.map((dept) => (
                                <option key={dept.id} value={dept.id}>
                                  {dept.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                              Level
                            </label>
                            <select
                              value={newTimetable.level_id}
                              onChange={(e) =>
                                setNewTimetable({
                                  ...newTimetable,
                                  level_id: e.target.value,
                                })
                              }
                              className='w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent'
                            >
                              <option value=''>Select Level (Optional)</option>
                              {levels.map((lvl) => (
                                <option key={lvl.id} value={lvl.id}>
                                  {lvl.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                              Week Start Date{' '}
                              <span className='text-red-500'>*</span>
                            </label>
                            <input
                              type='date'
                              value={newTimetable.week_start}
                              onChange={(e) =>
                                setNewTimetable({
                                  ...newTimetable,
                                  week_start: e.target.value,
                                })
                              }
                              className='w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent'
                            />
                          </div>
                          <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                              Academic Year
                            </label>
                            <input
                              type='text'
                              placeholder='e.g., 2024-2025'
                              value={newTimetable.academic_year}
                              onChange={(e) =>
                                setNewTimetable({
                                  ...newTimetable,
                                  academic_year: e.target.value,
                                })
                              }
                              className='w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent'
                            />
                          </div>
                          <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                              Semester
                            </label>
                            <select
                              value={newTimetable.semester}
                              onChange={(e) =>
                                setNewTimetable({
                                  ...newTimetable,
                                  semester: e.target.value,
                                })
                              }
                              className='w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent'
                            >
                              <option value=''>Select Semester</option>
                              <option value='Fall'>Fall</option>
                              <option value='Spring'>Spring</option>
                              <option value='Summer'>Summer</option>
                            </select>
                          </div>
                          <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                              Status
                            </label>
                            <select
                              value={newTimetable.status}
                              onChange={(e) =>
                                setNewTimetable({
                                  ...newTimetable,
                                  status: e.target.value,
                                })
                              }
                              className='w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent'
                            >
                              <option value='draft'>Draft</option>
                              <option value='published'>Published</option>
                              <option value='archived'>Archived</option>
                            </select>
                          </div>
                        </div>
                        <div className='flex justify-end gap-3 mt-6'>
                          <button
                            onClick={() => {
                              setShowAddForm(false);
                              setNewTimetable({
                                name: '',
                                department_id: '',
                                level_id: '',
                                week_start: '',
                                academic_year: '',
                                semester: '',
                                status: 'draft',
                              });
                              setError('');
                            }}
                            className='px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition text-sm font-medium'
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleAddTimetable}
                            disabled={isSubmitting}
                            className='px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
                          >
                            {isSubmitting ? (
                              <>
                                <svg
                                  className='animate-spin h-4 w-4'
                                  xmlns='http://www.w3.org/2000/svg'
                                  fill='none'
                                  viewBox='0 0 24 24'
                                >
                                  <circle
                                    className='opacity-25'
                                    cx='12'
                                    cy='12'
                                    r='10'
                                    stroke='currentColor'
                                    strokeWidth='4'
                                  ></circle>
                                  <path
                                    className='opacity-75'
                                    fill='currentColor'
                                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                                  ></path>
                                </svg>
                                Creating...
                              </>
                            ) : (
                              'Create Timetable'
                            )}
                          </button>
                        </div>
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
                                <td className='px-6 py-4 text-sm text-gray-900 font-medium'>
                                  {item.name}
                                </td>
                                <td className='px-6 py-4 text-sm text-gray-600'>
                                  {departments.find(
                                    (d) => d.id === item.department_id,
                                  )?.name || 'N/A'}
                                </td>
                                <td className='px-6 py-4 text-sm text-gray-600'>
                                  {item.level_name ||
                                    levels.find((l) => l.id === item.level_id)
                                      ?.name ||
                                    'N/A'}
                                </td>
                                <td className='px-6 py-4 text-sm text-gray-600'>
                                  {item.academic_year || 'N/A'}
                                </td>
                                <td className='px-6 py-4 text-sm'>
                                  <span
                                    className={`px-2 py-1 rounded text-xs font-medium ${
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
                                <td className='px-6 py-4 text-sm'>
                                  <div className='flex items-center gap-3'>
                                    <button
                                      onClick={() =>
                                        handleEditTimetable(item.id)
                                      }
                                      className='text-gray-900 hover:text-gray-700 text-sm font-medium hover:underline'
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleSelectTimetable(item.id)
                                      }
                                      className={`text-sm font-medium ${
                                        selectedTimetableId === item.id
                                          ? 'text-green-600 font-semibold'
                                          : 'text-blue-600'
                                      } hover:underline`}
                                    >
                                      {selectedTimetableId === item.id
                                        ? 'Selected'
                                        : 'Manage Slots'}
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteTimetable(item.id)
                                      }
                                      className='text-red-600 hover:text-red-700 text-sm font-medium hover:underline'
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>

                    {/* Slots Management Panel */}
                    {selectedTimetableId && (
                      <div className='mt-8 bg-white rounded-lg border border-gray-200 shadow-md p-6'>
                        <div className='flex items-center justify-between mb-6'>
                          <div>
                            <h3 className='text-lg font-bold text-gray-900'>
                              Manage Slots
                            </h3>
                            <p className='text-sm text-gray-600 mt-1'>
                              Timetable:{' '}
                              {timetables.find(
                                (t) => t.id === selectedTimetableId,
                              )?.name || `#${selectedTimetableId}`}
                            </p>
                          </div>
                          <button
                            onClick={() => handleOpenSlotModal()}
                            className='bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition text-sm font-medium flex items-center gap-2'
                          >
                            <span>+</span>
                            <span>Add New Slot</span>
                          </button>
                        </div>

                        {/* Slots List */}
                        {loadingSlots ? (
                          <div className='p-12 text-center'>
                            <p className='text-gray-600'>Loading slots...</p>
                          </div>
                        ) : slots.length === 0 ? (
                          <div className='p-12 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300'>
                            <p className='text-gray-500 mb-4'>
                              No slots have been added yet
                            </p>
                            <button
                              onClick={() => handleOpenSlotModal()}
                              className='bg-gray-900 text-white px-6 py-2 rounded-md hover:bg-gray-800 transition text-sm font-medium'
                            >
                              Add First Slot
                            </button>
                          </div>
                        ) : (
                          <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
                            <table className='w-full'>
                              <thead className='bg-gray-900 text-white'>
                                <tr>
                                  <th className='px-6 py-3 text-left text-sm font-semibold'>
                                    Day
                                  </th>
                                  <th className='px-6 py-3 text-left text-sm font-semibold'>
                                    Time
                                  </th>
                                  <th className='px-6 py-3 text-left text-sm font-semibold'>
                                    Course
                                  </th>
                                  <th className='px-6 py-3 text-left text-sm font-semibold'>
                                    Room
                                  </th>
                                  <th className='px-6 py-3 text-left text-sm font-semibold'>
                                    Teacher
                                  </th>
                                  <th className='px-6 py-3 text-left text-sm font-semibold'>
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody className='divide-y divide-gray-200'>
                                {slots.map((s) => (
                                  <tr
                                    key={s.id}
                                    className='hover:bg-gray-50 transition-colors'
                                  >
                                    <td className='px-6 py-4 text-sm text-gray-900 font-medium'>
                                      {s.day_name ||
                                        dayNumberToName(s.day_of_week) ||
                                        'N/A'}
                                    </td>
                                    <td className='px-6 py-4 text-sm text-gray-700'>
                                      {s.start_time && s.end_time
                                        ? `${s.start_time} - ${s.end_time}`
                                        : 'N/A'}
                                    </td>
                                    <td className='px-6 py-4 text-sm'>
                                      <div className='text-gray-900 font-medium'>
                                        {s.course?.code || 'N/A'}
                                      </div>
                                      <div className='text-gray-600 text-xs'>
                                        {s.course?.name || ''}
                                      </div>
                                    </td>
                                    <td className='px-6 py-4 text-sm text-gray-700'>
                                      {s.room?.name ||
                                        s.room?.code ||
                                        s.room_name || (
                                          <span className='text-gray-400 italic'>
                                            Not assigned
                                          </span>
                                        )}
                                    </td>
                                    <td className='px-6 py-4 text-sm text-gray-700'>
                                      {s.teacher?.name ||
                                        s.teacher?.full_name ||
                                        (s.teacher?.first_name &&
                                        s.teacher?.last_name
                                          ? `${s.teacher.first_name} ${s.teacher.last_name}`
                                          : s.teacher_name) || (
                                          <span className='text-gray-400 italic'>
                                            Not assigned
                                          </span>
                                        )}
                                    </td>
                                    <td className='px-6 py-4 text-sm'>
                                      <div className='flex items-center gap-3'>
                                        <button
                                          onClick={() => handleOpenSlotModal(s)}
                                          className='text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline'
                                        >
                                          Edit
                                        </button>
                                        <button
                                          onClick={() => handleDeleteSlot(s.id)}
                                          className='text-red-600 hover:text-red-700 text-sm font-medium hover:underline'
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
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

      {/* Edit Timetable Modal */}
      {showEditModal && editingTimetableId && (
        <>
          <div
            className='fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm z-50'
            onClick={handleCancelEditTimetable}
          ></div>
          <div className='fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none'>
            <div
              className='bg-white rounded-lg shadow-2xl max-w-2xl w-full border border-gray-200 transform transition-all pointer-events-auto'
              onClick={(e) => e.stopPropagation()}
            >
              <div className='bg-gray-900 text-white px-6 py-4 rounded-t-lg flex items-center justify-between'>
                <h2 className='text-xl font-bold'>Edit Timetable</h2>
                <button
                  onClick={handleCancelEditTimetable}
                  className='text-white hover:text-gray-300 text-2xl'
                >
                  ×
                </button>
              </div>
              <div className='p-6'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Timetable Name <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='text'
                      value={editTimetableData.name || ''}
                      onChange={(e) =>
                        setEditTimetableData({
                          ...editTimetableData,
                          name: e.target.value,
                        })
                      }
                      className='w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Department <span className='text-red-500'>*</span>
                    </label>
                    <select
                      value={editTimetableData.department_id || ''}
                      onChange={(e) =>
                        setEditTimetableData({
                          ...editTimetableData,
                          department_id: e.target.value,
                        })
                      }
                      className='w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent'
                    >
                      <option value=''>Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Level
                    </label>
                    <select
                      value={editTimetableData.level_id || ''}
                      onChange={(e) =>
                        setEditTimetableData({
                          ...editTimetableData,
                          level_id: e.target.value,
                        })
                      }
                      className='w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent'
                    >
                      <option value=''>Select Level (Optional)</option>
                      {levels.map((lvl) => (
                        <option key={lvl.id} value={lvl.id}>
                          {lvl.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Week Start Date <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='date'
                      value={editTimetableData.week_start || ''}
                      onChange={(e) =>
                        setEditTimetableData({
                          ...editTimetableData,
                          week_start: e.target.value,
                        })
                      }
                      className='w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Academic Year
                    </label>
                    <input
                      type='text'
                      placeholder='e.g., 2024-2025'
                      value={editTimetableData.academic_year || ''}
                      onChange={(e) =>
                        setEditTimetableData({
                          ...editTimetableData,
                          academic_year: e.target.value,
                        })
                      }
                      className='w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Semester
                    </label>
                    <select
                      value={editTimetableData.semester || ''}
                      onChange={(e) =>
                        setEditTimetableData({
                          ...editTimetableData,
                          semester: e.target.value,
                        })
                      }
                      className='w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent'
                    >
                      <option value=''>Select Semester</option>
                      <option value='Fall'>Fall</option>
                      <option value='Spring'>Spring</option>
                      <option value='Summer'>Summer</option>
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Status
                    </label>
                    <select
                      value={editTimetableData.status || 'draft'}
                      onChange={(e) =>
                        setEditTimetableData({
                          ...editTimetableData,
                          status: e.target.value,
                        })
                      }
                      className='w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent'
                    >
                      <option value='draft'>Draft</option>
                      <option value='published'>Published</option>
                      <option value='archived'>Archived</option>
                    </select>
                  </div>
                </div>
                <div className='flex justify-end gap-3 mt-6'>
                  <button
                    onClick={handleCancelEditTimetable}
                    className='px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition text-sm font-medium'
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEditTimetable}
                    disabled={isSubmitting}
                    className='px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className='animate-spin h-4 w-4'
                          xmlns='http://www.w3.org/2000/svg'
                          fill='none'
                          viewBox='0 0 24 24'
                        >
                          <circle
                            className='opacity-25'
                            cx='12'
                            cy='12'
                            r='10'
                            stroke='currentColor'
                            strokeWidth='4'
                          ></circle>
                          <path
                            className='opacity-75'
                            fill='currentColor'
                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                          ></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add/Edit Slot Modal */}
      {showSlotModal && selectedTimetableId && (
        <>
          <div
            className='fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm z-50'
            onClick={handleCloseSlotModal}
          ></div>
          <div className='fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none'>
            <div
              className='bg-white rounded-lg shadow-2xl max-w-2xl w-full border border-gray-200 transform transition-all max-h-[90vh] overflow-y-auto pointer-events-auto'
              onClick={(e) => e.stopPropagation()}
            >
              <div className='bg-gray-900 text-white px-6 py-4 rounded-t-lg flex items-center justify-between sticky top-0'>
                <h2 className='text-xl font-bold'>
                  {editingSlotId ? 'Edit Slot' : 'Add New Slot'}
                </h2>
                <button
                  onClick={handleCloseSlotModal}
                  className='text-white hover:text-gray-300 text-2xl'
                >
                  ×
                </button>
              </div>
              <div className='p-6'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Day of Week <span className='text-red-500'>*</span>
                    </label>
                    <select
                      value={newSlot.day_of_week}
                      onChange={(e) =>
                        setNewSlot({
                          ...newSlot,
                          day_of_week: e.target.value,
                        })
                      }
                      className='w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent'
                    >
                      <option value=''>Select Day</option>
                      <option value='Monday'>Monday</option>
                      <option value='Tuesday'>Tuesday</option>
                      <option value='Wednesday'>Wednesday</option>
                      <option value='Thursday'>Thursday</option>
                      <option value='Friday'>Friday</option>
                      <option value='Saturday'>Saturday</option>
                      <option value='Sunday'>Sunday</option>
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Start Time <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='time'
                      value={newSlot.start_time}
                      onChange={(e) =>
                        setNewSlot({
                          ...newSlot,
                          start_time: e.target.value,
                        })
                      }
                      className='w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      End Time <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='time'
                      value={newSlot.end_time}
                      onChange={(e) =>
                        setNewSlot({
                          ...newSlot,
                          end_time: e.target.value,
                        })
                      }
                      className='w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent'
                    />
                  </div>
                  <div className='md:col-span-2'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Course <span className='text-red-500'>*</span>
                    </label>
                    <select
                      value={newSlot.course_id}
                      onChange={(e) =>
                        setNewSlot({
                          ...newSlot,
                          course_id: e.target.value,
                        })
                      }
                      className='w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent'
                    >
                      <option value=''>Select Course</option>
                      {(() => {
                        const selectedTimetable = timetables.find(
                          (t) => String(t.id) === String(selectedTimetableId),
                        );
                        const levelId = selectedTimetable?.level_id
                          ? Number(selectedTimetable.level_id)
                          : null;
                        // Show ALL courses at this level (not just those with teachers)
                        const filteredCourses = levelId
                          ? courses.filter(
                              (c) =>
                                c.level_id && Number(c.level_id) === levelId,
                            )
                          : courses;
                        return filteredCourses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.code} - {c.name}
                          </option>
                        ));
                      })()}
                    </select>
                    {(() => {
                      const selectedTimetable = timetables.find(
                        (t) => String(t.id) === String(selectedTimetableId),
                      );
                      const levelId = selectedTimetable?.level_id
                        ? Number(selectedTimetable.level_id)
                        : null;
                      const filteredCourses = levelId
                        ? courses.filter(
                            (c) => c.level_id && Number(c.level_id) === levelId,
                          )
                        : courses;
                      if (filteredCourses.length === 0 && courses.length > 0) {
                        return (
                          <p className='text-xs text-amber-600 mt-1'>
                            No courses available for this level. Please add
                            courses for this level first.
                          </p>
                        );
                      }
                      return null;
                    })()}
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Room
                    </label>
                    <select
                      value={newSlot.room_id}
                      onChange={(e) =>
                        setNewSlot({
                          ...newSlot,
                          room_id: e.target.value,
                        })
                      }
                      className='w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent'
                    >
                      <option value=''>Select Room (Optional)</option>
                      {(() => {
                        // If time is selected, show only available rooms, otherwise show all available rooms
                        const roomsToShow =
                          newSlot.day_of_week &&
                          newSlot.start_time &&
                          newSlot.end_time &&
                          availableRooms.length > 0
                            ? availableRooms
                            : rooms.filter((r) => r.is_available !== false);

                        return roomsToShow.map((r) => {
                          const roomId = r.id || r.room_id;
                          const roomName = r.name || r.code || `Room ${roomId}`;
                          const isUnavailable =
                            newSlot.day_of_week &&
                            newSlot.start_time &&
                            newSlot.end_time &&
                            availableRooms.length > 0 &&
                            !availableRooms.some((ar) => ar.id === roomId);

                          return (
                            <option
                              key={roomId}
                              value={roomId}
                              disabled={isUnavailable}
                            >
                              {roomName}
                              {isUnavailable ? ' (Unavailable)' : ''}
                            </option>
                          );
                        });
                      })()}
                    </select>
                    {(() => {
                      const roomsToShow =
                        newSlot.day_of_week &&
                        newSlot.start_time &&
                        newSlot.end_time &&
                        availableRooms.length > 0
                          ? availableRooms
                          : rooms.filter((r) => r.is_available !== false);

                      if (checkingAvailability) {
                        return (
                          <p className='text-xs text-blue-600 mt-1'>
                            Checking availability...
                          </p>
                        );
                      }
                      if (
                        newSlot.day_of_week &&
                        newSlot.start_time &&
                        newSlot.end_time &&
                        availableRooms.length === 0 &&
                        rooms.filter((r) => r.is_available !== false).length > 0
                      ) {
                        return (
                          <p className='text-xs text-amber-600 mt-1'>
                            No rooms available at this time. Please select a
                            different time slot.
                          </p>
                        );
                      }
                      if (roomsToShow.length === 0) {
                        return (
                          <p className='text-xs text-gray-500 mt-1'>
                            No rooms available. Please add rooms first.
                          </p>
                        );
                      }
                      return null;
                    })()}
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Teacher
                    </label>
                    <select
                      value={newSlot.teacher_id}
                      onChange={(e) =>
                        setNewSlot({
                          ...newSlot,
                          teacher_id: e.target.value,
                        })
                      }
                      className='w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent'
                    >
                      <option value=''>Select Teacher (Optional)</option>
                      {(() => {
                        // If time is selected, show only available teachers, otherwise show all teachers for the level
                        const selectedTimetable = timetables.find(
                          (t) => String(t.id) === String(selectedTimetableId),
                        );
                        const levelId = selectedTimetable?.level_id
                          ? Number(selectedTimetable.level_id)
                          : null;

                        const teachersToShow =
                          newSlot.day_of_week &&
                          newSlot.start_time &&
                          newSlot.end_time &&
                          availableTeachers.length > 0
                            ? availableTeachers
                            : levelId
                            ? teachers.filter((teacher) => {
                                return courses.some(
                                  (c) =>
                                    c.level_id &&
                                    Number(c.level_id) === levelId &&
                                    c.teacher_id &&
                                    Number(c.teacher_id) === Number(teacher.id),
                                );
                              })
                            : teachers;

                        return teachersToShow.map((t) => {
                          const isUnavailable =
                            newSlot.day_of_week &&
                            newSlot.start_time &&
                            newSlot.end_time &&
                            availableTeachers.length > 0 &&
                            !availableTeachers.some(
                              (at) => Number(at.id) === Number(t.id),
                            );

                          return (
                            <option
                              key={t.id}
                              value={t.id}
                              disabled={isUnavailable}
                            >
                              {t.name ||
                                t.full_name ||
                                `${t.first_name || ''} ${
                                  t.last_name || ''
                                }`.trim() ||
                                `Teacher ${t.id}`}
                              {isUnavailable ? ' (Unavailable)' : ''}
                            </option>
                          );
                        });
                      })()}
                    </select>
                    {(() => {
                      const selectedTimetable = timetables.find(
                        (t) => String(t.id) === String(selectedTimetableId),
                      );
                      const levelId = selectedTimetable?.level_id
                        ? Number(selectedTimetable.level_id)
                        : null;

                      if (checkingAvailability) {
                        return (
                          <p className='text-xs text-blue-600 mt-1'>
                            Checking availability...
                          </p>
                        );
                      }

                      const levelTeachers = levelId
                        ? teachers.filter((teacher) => {
                            return courses.some(
                              (c) =>
                                c.level_id &&
                                Number(c.level_id) === levelId &&
                                c.teacher_id &&
                                Number(c.teacher_id) === Number(teacher.id),
                            );
                          })
                        : teachers;

                      const teachersToShow =
                        newSlot.day_of_week &&
                        newSlot.start_time &&
                        newSlot.end_time &&
                        availableTeachers.length > 0
                          ? availableTeachers
                          : levelTeachers;

                      if (
                        newSlot.day_of_week &&
                        newSlot.start_time &&
                        newSlot.end_time &&
                        availableTeachers.length === 0 &&
                        levelTeachers.length > 0
                      ) {
                        return (
                          <p className='text-xs text-amber-600 mt-1'>
                            No teachers available at this time. Please select a
                            different time slot.
                          </p>
                        );
                      }

                      if (teachersToShow.length === 0 && teachers.length > 0) {
                        return (
                          <p className='text-xs text-amber-600 mt-1'>
                            No teachers available for this level. Please assign
                            teachers to courses for this level first.
                          </p>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>
                {error && (
                  <div className='mt-4 p-4 bg-red-50 border border-red-200 rounded-md'>
                    <p className='text-sm text-red-800 font-medium'>{error}</p>
                  </div>
                )}
                <div className='flex justify-end gap-3 mt-6'>
                  <button
                    onClick={handleCloseSlotModal}
                    className='px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition text-sm font-medium'
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddSlot}
                    disabled={isSubmitting}
                    className='px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className='animate-spin h-4 w-4'
                          xmlns='http://www.w3.org/2000/svg'
                          fill='none'
                          viewBox='0 0 24 24'
                        >
                          <circle
                            className='opacity-25'
                            cx='12'
                            cy='12'
                            r='10'
                            stroke='currentColor'
                            strokeWidth='4'
                          ></circle>
                          <path
                            className='opacity-75'
                            fill='currentColor'
                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                          ></path>
                        </svg>
                        {editingSlotId ? 'Updating...' : 'Creating...'}
                      </>
                    ) : editingSlotId ? (
                      'Update Slot'
                    ) : (
                      'Create Slot'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.isOpen && (
        <>
          <div
            className='fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm z-50'
            onClick={() =>
              setDeleteConfirm({
                isOpen: false,
                id: null,
                name: '',
                type: 'timetable',
              })
            }
          ></div>
          <div className='fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none'>
            <div
              className='bg-white rounded-lg shadow-2xl max-w-md w-full border border-gray-200 transform transition-all pointer-events-auto'
              onClick={(e) => e.stopPropagation()}
            >
              <div className='bg-red-600 text-white px-6 py-4 rounded-t-lg'>
                <h2 className='text-xl font-bold'>Confirm Delete</h2>
              </div>
              <div className='p-6'>
                <p className='text-gray-700 mb-4'>
                  Are you sure you want to delete{' '}
                  <span className='font-semibold text-gray-900'>
                    "{deleteConfirm.name}"
                  </span>
                  ? This action cannot be undone.
                </p>
                {deleteConfirm.type === 'timetable' && (
                  <p className='text-sm text-red-600 mb-4'>
                    ⚠️ Warning: All slots associated with this timetable will
                    also be deleted.
                  </p>
                )}
                {deleteConfirm.type === 'slot' && (
                  <p className='text-sm text-gray-600 mb-4'>
                    This slot will be permanently removed from the timetable.
                  </p>
                )}
                <div className='flex justify-end gap-3'>
                  <button
                    onClick={() =>
                      setDeleteConfirm({
                        isOpen: false,
                        id: null,
                        name: '',
                        type: 'timetable',
                      })
                    }
                    className='px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition text-sm font-medium'
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={isSubmitting}
                    className='px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className='animate-spin h-4 w-4'
                          xmlns='http://www.w3.org/2000/svg'
                          fill='none'
                          viewBox='0 0 24 24'
                        >
                          <circle
                            className='opacity-25'
                            cx='12'
                            cy='12'
                            r='10'
                            stroke='currentColor'
                            strokeWidth='4'
                          ></circle>
                          <path
                            className='opacity-75'
                            fill='currentColor'
                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                          ></path>
                        </svg>
                        Deleting...
                      </>
                    ) : (
                      'Delete'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
