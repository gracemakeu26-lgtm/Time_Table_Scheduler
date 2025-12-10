import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
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

  // Check authentication on mount
  useEffect(() => {
    const token = getFromStorage('auth_token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch data on mount and when tab changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        if (activeTab === 'timetables' || activeTab === 'overview') {
          const timetablesData = await timetablesAPI.getAll({
            include_slots: false,
          });
          setTimetables(
            Array.isArray(timetablesData)
              ? timetablesData
              : timetablesData.data || [],
          );
        }
        if (activeTab === 'faculty' || activeTab === 'overview') {
          const departmentsData = await departmentsAPI.getAll();
          setDepartments(
            Array.isArray(departmentsData)
              ? departmentsData
              : departmentsData.data || [],
          );
        }
        if (activeTab === 'timetables') {
          const [levelsData, coursesData, roomsData, teachersData] =
            await Promise.all([
              levelsAPI.getAll({ active_only: true }),
              coursesAPI.getAll(),
              roomsAPI.getAll(),
              teachersAPI.getAll(),
            ]);
          setLevels(
            Array.isArray(levelsData) ? levelsData : levelsData.data || [],
          );
          setCourses(
            Array.isArray(coursesData) ? coursesData : coursesData.data || [],
          );
          setRooms(Array.isArray(roomsData) ? roomsData : roomsData.data || []);
          setTeachers(
            Array.isArray(teachersData)
              ? teachersData
              : teachersData.data || [],
          );
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

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

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col'>
      <Header />

      <div
        className='min-h-screen flex flex-col items-center pt-22'
        style={{
          backgroundImage: "url('/assets/background.jpg')",
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <main className='grow w-full'>
          {/* Dashboard Header */}
          <div className='shadow-2xl w-full mt-4 bg-white rounded-xs border-b border-gray-200'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
              <div className='flex justify-between items-center'>
                <div>
                  <h1 className='pt-3 text-3xl font-bold text-blue-600'>
                    Administration Dashboard
                  </h1>
                  <p className='text-gray-600 text-sm mt-1'>
                    Manage timetables and schedules
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className='bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition text-sm font-medium'
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className='shadow-2xl border-b border-gray-200'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
              <nav className='flex gap-12 text-sm font-medium'>
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-4 border-b-2 transition ${
                    activeTab === 'overview'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-300 hover:text-gray-700 hover:-translate-y-1'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('timetables')}
                  className={`py-4 border-b-2 transition ${
                    activeTab === 'timetables'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-300 hover:text-gray-700 hover:-translate-y-1'
                  }`}
                >
                  Timetables
                </button>
                <button
                  onClick={() => setActiveTab('faculty')}
                  className={`py-4 border-b-2 transition ${
                    activeTab === 'faculty'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-300 hover:text-gray-700 hover:-translate-y-1'
                  }`}
                >
                  Departments
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`py-4 border-b-2 transition ${
                    activeTab === 'settings'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-300 hover:text-gray-700 hover:-translate-y-1'
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
                    <h2 className='text-xl font-bold text-blue-600 mb-6'>
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
                      <h3 className='text-lg font-bold text-blue-600 mb-4'>
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
                                <div className='font-medium text-blue-600'>
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
                      <h2 className='text-xl font-bold text-blue-600'>
                        Manage Timetables
                      </h2>
                      <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-sm font-medium'
                      >
                        {showAddForm ? 'Cancel' : 'Add New Timetable'}
                      </button>
                    </div>

                    {/* Add Form */}
                    {showAddForm && (
                      <div className='bg-white rounded-md border border-gray-200 p-6 mb-6'>
                        <h3 className='text-base font-semibold text-blue-600 mb-4'>
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
                          className='mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-sm font-medium'
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
                              <th className='px-6 py-3 text-left text-sm font-semibold text-blue-600'>
                                Name
                              </th>
                              <th className='px-6 py-3 text-left text-sm font-semibold text-blue-600'>
                                Department
                              </th>
                              <th className='px-6 py-3 text-left text-sm font-semibold text-blue-600'>
                                Level
                              </th>
                              <th className='px-6 py-3 text-left text-sm font-semibold text-blue-600'>
                                Academic Year
                              </th>
                              <th className='px-6 py-3 text-left text-sm font-semibold text-blue-600'>
                                Status
                              </th>
                              <th className='px-6 py-3 text-left text-sm font-semibold text-blue-600'>
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
                                        className='text-blue-600 hover:text-gray-700 text-sm font-medium'
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
                                    <td className='px-6 py-4 text-sm text-blue-400 font-medium'>
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
                                        className='text-blue-600 hover:text-gray-700 text-sm font-medium'
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
                        <h3 className='text-base font-semibold text-blue-600 mb-4'>
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
                          className='mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-sm font-medium'
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
                                  <th className='px-6 py-3 text-left text-sm font-semibold text-blue-600'>
                                    Day
                                  </th>
                                  <th className='px-6 py-3 text-left text-sm font-semibold text-blue-600'>
                                    Time
                                  </th>
                                  <th className='px-6 py-3 text-left text-sm font-semibold text-blue-600'>
                                    Course
                                  </th>
                                  <th className='px-6 py-3 text-left text-sm font-semibold text-blue-600'>
                                    Room
                                  </th>
                                  <th className='px-6 py-3 text-left text-sm font-semibold text-blue-600'>
                                    Teacher
                                  </th>
                                  <th className='px-6 py-3 text-left text-sm font-semibold text-blue-600'>
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody className='divide-y'>
                                {slots.map((s) => (
                                  <tr key={s.id} className='hover:bg-gray-50'>
                                    <td className='px-6 py-4 text-sm text-blue-600 font-medium'>
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
                                      <button className='text-blue-600 hover:text-gray-700 text-sm font-medium'>
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
                      <h2 className='text-xl font-bold text-blue-600'>
                        Departments
                      </h2>
                      <button
                        onClick={() =>
                          setShowAddDepartmentForm(!showAddDepartmentForm)
                        }
                        className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-sm font-medium'
                      >
                        {showAddDepartmentForm ? 'Cancel' : 'Add Department'}
                      </button>
                    </div>

                    {/* Add Department Form */}
                    {showAddDepartmentForm && (
                      <div className='bg-white rounded-md border border-gray-200 p-6 mb-6'>
                        <h3 className='text-base font-semibold text-blue-600 mb-4'>
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
                          className='mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-sm font-medium'
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
                              <th className='px-6 py-3 text-left text-sm font-semibold text-blue-600'>
                                Name
                              </th>
                              <th className='px-6 py-3 text-left text-sm font-semibold text-blue-600'>
                                Code
                              </th>
                              <th className='px-6 py-3 text-left text-sm font-semibold text-blue-600'>
                                Head
                              </th>
                              <th className='px-6 py-3 text-left text-sm font-semibold text-blue-600'>
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
                                        className='text-blue-600 hover:text-gray-700 text-sm font-medium'
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
                                    <td className='px-6 py-4 text-sm text-blue-600 font-medium'>
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
                                        className='text-blue-600 hover:text-gray-700 text-sm font-medium'
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

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                  <div>
                    <h2 className='text-xl font-bold text-blue-600 mb-6'>
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
