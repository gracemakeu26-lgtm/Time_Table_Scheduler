import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/layout/Footer';
import { authAPI, timetablesAPI, departmentsAPI, slotsAPI } from '../utils/api';
import {
  useAdminDashboard,
  useTimetableView,
  useSlotAvailability,
} from '../hooks/adminDashboard';
import {
  NavigationTabs,
  OverviewTab,
  SettingsTab,
  DeleteConfirmationModal,
} from '../components/AdminDashboard';
import { dayNumberToName, dayNameToNumber } from '../utils/adminDashboard';
import { DAY_MAP } from '../constants/adminDashboard';

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Main dashboard data hook
  const {
    activeTab,
    setActiveTab,
    timetables,
    setTimetables,
    departments,
    setDepartments,
    levels,
    courses,
    rooms,
    teachers,
    loading,
    error,
    setError,
    success,
    setSuccess,
  } = useAdminDashboard();

  // Timetable view hook
  const timetableView = useTimetableView();

  // Local state for timetable/slot management
  const [selectedTimetableId, setSelectedTimetableId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    id: null,
    name: '',
    type: 'timetable',
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

  // Slot availability hook
  const slotAvailability = useSlotAvailability(
    newSlot,
    selectedTimetableId,
    timetables,
    courses,
    teachers,
    showSlotModal,
    editingSlotId,
  );

  // Calculate stats
  const stats = useMemo(
    () => ({
      departments: departments.length,
      timetables: timetables.length,
      publishedTimetables: timetables.filter((t) => t.status === 'published')
        .length,
      draftTimetables: timetables.filter((t) => t.status === 'draft').length,
    }),
    [departments.length, timetables],
  );

  // Timetable Functions
  const handleAddTimetable = async () => {
    setError('');
    setSuccess('');

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

  const handleOpenSlotModal = (slot = null) => {
    if (slot) {
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
    slotAvailability.clearAvailability();
    setError('');
  };

  const handleAddSlot = async () => {
    setError('');
    setSuccess('');

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
      if (newSlot.room_id || newSlot.teacher_id) {
        try {
          const dayNumber = dayNameToNumber(newSlot.day_of_week);
          const conflictData = {
            day_of_week: dayNumber !== null ? dayNumber : newSlot.day_of_week,
            start_time: newSlot.start_time,
            end_time: newSlot.end_time,
            room_id: newSlot.room_id || null,
            teacher_id: newSlot.teacher_id || null,
            exclude_slot_id: editingSlotId || null,
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
          console.warn('Conflict check failed:', conflictErr);
        }
      }

      if (editingSlotId) {
        await slotsAPI.update(selectedTimetableId, editingSlotId, newSlot);
        setSuccess('Slot updated successfully!');
      } else {
        await slotsAPI.create(selectedTimetableId, newSlot);
        setSuccess('Slot created successfully!');
      }
      handleCloseSlotModal();
      await loadSlots(selectedTimetableId);
    } catch (err) {
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
                {activeTab === 'overview' && (
                  <OverviewTab timetables={timetables} stats={stats} />
                )}

                {activeTab === 'timetables' && (
                  <div>
                    <p className='text-gray-600'>
                      Timetables tab - Component to be created
                    </p>
                  </div>
                )}

                {activeTab === 'faculty' && (
                  <div>
                    <p className='text-gray-600'>
                      Departments tab - Component to be created
                    </p>
                  </div>
                )}

                {activeTab === 'timetable-view' && (
                  <div>
                    <p className='text-gray-600'>
                      Timetable View tab - Component to be created
                    </p>
                  </div>
                )}

                {activeTab === 'settings' && <SettingsTab />}
              </>
            )}
          </div>
        </main>

        <Footer />
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteConfirm.isOpen}
        name={deleteConfirm.name}
        type={deleteConfirm.type}
        isSubmitting={isSubmitting}
        onClose={() =>
          setDeleteConfirm({
            isOpen: false,
            id: null,
            name: '',
            type: 'timetable',
          })
        }
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default AdminDashboard;
