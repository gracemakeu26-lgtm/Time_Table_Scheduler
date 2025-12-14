import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/layout/Footer';
import { getFromStorage } from '../utils/storage';
import { DAY_MAP } from '../constants/adminDashboard';
import {
  NavigationTabs,
  DeleteConfirmModal,
  DepartmentsTab,
  EditTimetableModal,
  OverviewTab,
  SettingsTab,
  SlotModal,
  TimetablesTab,
  TimetableViewTab,
} from '../components/AdminDashboard/index.js';

import {
  timeToMinutes,
  formatTimeSlot,
  dayNameToNumber,
  dayNumberToName,
} from '../utils/adminDashboard/timetableHelpers';

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
    day_of_week: 0,
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

        console.log('Fetched Data from Admin dashboard');
        console.log('timetable data from Admindashboard:', timetablesData);
        console.log('courses data from Admindashboard:', coursesData);
        console.log('levels data from Admindashboard:', levelsData);
        console.log('rooms data from Admindashboard:', roomsData);
        console.log('teachers data from Admindashboard:', teachersData);
        console.log('departments data from Admindashboard:', departmentsData);

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
          Array.isArray(coursesData.courses)
            ? coursesData.courses
            : coursesData.courses || [],
        );
        setRooms(
          Array.isArray(roomsData.rooms)
            ? roomsData.rooms
            : roomsData.rooms || [],
        );
        setTeachers(
          Array.isArray(teachersData.teachers)
            ? teachersData.teachers
            : teachersData.teachers || [],
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
          <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />

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
                  <OverviewTab stats={stats} timetables={timetables} />
                )}

                {/* Timetables Tab */}
                {activeTab === 'timetables' && (
                  <TimetablesTab
                    timetables={timetables}
                    departments={departments}
                    levels={levels}
                    showAddForm={showAddForm}
                    setShowAddForm={setShowAddForm}
                    newTimetable={newTimetable}
                    setNewTimetable={setNewTimetable}
                    handleAddTimetable={handleAddTimetable}
                    isSubmitting={isSubmitting}
                    setError={setError}
                    selectedTimetableId={selectedTimetableId}
                    handleEditTimetable={handleEditTimetable}
                    handleSelectTimetable={handleSelectTimetable}
                    handleDeleteTimetable={handleDeleteTimetable}
                    loadingSlots={loadingSlots}
                    slots={slots}
                    handleOpenSlotModal={handleOpenSlotModal}
                    dayNumberToName={dayNumberToName}
                    handleDeleteSlot={handleDeleteSlot}
                  />
                )}

                {/* Departments Tab */}
                {activeTab === 'faculty' && (
                  <DepartmentsTab
                    departments={departments}
                    showAddDepartmentForm={showAddDepartmentForm}
                    setShowAddDepartmentForm={setShowAddDepartmentForm}
                    newDepartment={newDepartment}
                    setNewDepartment={setNewDepartment}
                    handleAddDepartment={handleAddDepartment}
                    editingDepartmentId={editingDepartmentId}
                    editDepartmentData={editDepartmentData}
                    setEditDepartmentData={setEditDepartmentData}
                    handleEditDepartment={handleEditDepartment}
                    handleSaveEditDepartment={handleSaveEditDepartment}
                    handleCancelEditDepartment={handleCancelEditDepartment}
                    handleDeleteDepartment={handleDeleteDepartment}
                  />
                )}

                {/* Timetable View Tab */}
                {activeTab === 'timetable-view' && (
                  <TimetableViewTab
                    selectedSemester={selectedSemester}
                    setSelectedSemester={setSelectedSemester}
                    availableSemesters={availableSemesters}
                    selectedYear={selectedYear}
                    setSelectedYear={setSelectedYear}
                    availableYears={availableYears}
                    selectedDepartmentView={selectedDepartmentView}
                    setSelectedDepartmentView={setSelectedDepartmentView}
                    departments={departments}
                    selectedLevelView={selectedLevelView}
                    setSelectedLevelView={setSelectedLevelView}
                    levels={levels}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    clashes={clashes}
                    filteredTimetables={filteredTimetables}
                    allSlots={allSlots}
                    groupedSlots={groupedSlots}
                    displayDays={displayDays}
                    displayTimes={displayTimes}
                    formatTimeSlot={formatTimeSlot}
                    hasClash={hasClash}
                    getClashDetails={getClashDetails}
                    timetablesWithSlots={timetablesWithSlots}
                    loadingTimetablesWithSlots={loadingTimetablesWithSlots}
                  />
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && <SettingsTab />}
              </>
            )}
          </div>
        </main>

        <Footer />
      </div>

      {/* Modal Section */}

      {/* Edit Timetable Modal */}
      <EditTimetableModal
        showEditModal={showEditModal}
        editingTimetableId={editingTimetableId}
        handleCancelEditTimetable={handleCancelEditTimetable}
        editTimetableData={editTimetableData}
        setEditTimetableData={setEditTimetableData}
        departments={departments}
        levels={levels}
        handleSaveEditTimetable={handleSaveEditTimetable}
        isSubmitting={isSubmitting}
      />

      {/* Add/Edit Slot Modal */}
      <SlotModal
        showSlotModal={showSlotModal}
        selectedTimetableId={selectedTimetableId}
        handleCloseSlotModal={handleCloseSlotModal}
        editingSlotId={editingSlotId}
        newSlot={newSlot}
        setNewSlot={setNewSlot}
        timetables={timetables}
        courses={courses}
        departments={departments}
        availableRooms={availableRooms}
        rooms={rooms}
        checkingAvailability={checkingAvailability}
        availableTeachers={availableTeachers}
        teachers={teachers}
        error={error}
        handleAddSlot={handleAddSlot}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        deleteConfirm={deleteConfirm}
        setDeleteConfirm={setDeleteConfirm}
        confirmDelete={confirmDelete}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default AdminDashboard;
