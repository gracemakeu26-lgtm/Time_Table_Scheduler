import React, { useState } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timetables, setTimetables] = useState([
    { id: 1, name: 'CS L1', faculty: 'Sciences', courses: 12, status: 'active' },
    { id: 2, name: 'ENG L2', faculty: 'Engineering', courses: 15, status: 'active' },
    { id: 3, name: 'BUS L1', faculty: 'Business', courses: 10, status: 'pending' },
  ]);
  const [faculties, setFaculties] = useState([
    { id: 1, name: 'Sciences', departments: 4, programs: 8 },
    { id: 2, name: 'Engineering', departments: 5, programs: 10 },
    { id: 3, name: 'Business', departments: 3, programs: 6 },
    { id: 4, name: 'Letters & Human Sciences', departments: 6, programs: 12 },
    { id: 5, name: 'Education', departments: 4, programs: 8 },
  ]);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddFacultyForm, setShowAddFacultyForm] = useState(false);
  const [newTimetable, setNewTimetable] = useState({ name: '', faculty: '', courses: '' });
  const [newFaculty, setNewFaculty] = useState({ name: '', departments: '', programs: '' });
  
  const [editingTimetableId, setEditingTimetableId] = useState(null);
  const [editingFacultyId, setEditingFacultyId] = useState(null);
  const [editTimetableData, setEditTimetableData] = useState({});
  const [editFacultyData, setEditFacultyData] = useState({});

  // Timetable Functions
  const handleAddTimetable = () => {
    if (newTimetable.name && newTimetable.faculty) {
      setTimetables([
        ...timetables,
        { id: Date.now(), ...newTimetable, courses: parseInt(newTimetable.courses) || 0, status: 'pending' }
      ]);
      setNewTimetable({ name: '', faculty: '', courses: '' });
      setShowAddForm(false);
    }
  };

  const handleDeleteTimetable = (id) => {
    setTimetables(timetables.filter(t => t.id !== id));
  };

  const handleEditTimetable = (id) => {
    const timetable = timetables.find(t => t.id === id);
    setEditingTimetableId(id);
    setEditTimetableData({ ...timetable });
  };

  const handleSaveEditTimetable = () => {
    if (editTimetableData.name && editTimetableData.faculty) {
      setTimetables(timetables.map(t => 
        t.id === editingTimetableId 
          ? { ...editTimetableData, courses: parseInt(editTimetableData.courses) || 0 }
          : t
      ));
      setEditingTimetableId(null);
      setEditTimetableData({});
    }
  };

  const handleCancelEditTimetable = () => {
    setEditingTimetableId(null);
    setEditTimetableData({});
  };

  // Faculty Functions
  const handleAddFaculty = () => {
    if (newFaculty.name && newFaculty.departments) {
      setFaculties([
        ...faculties,
        { 
          id: Date.now(), 
          name: newFaculty.name, 
          departments: parseInt(newFaculty.departments) || 0,
          programs: parseInt(newFaculty.programs) || 0
        }
      ]);
      setNewFaculty({ name: '', departments: '', programs: '' });
      setShowAddFacultyForm(false);
    }
  };

  const handleDeleteFaculty = (id) => {
    setFaculties(faculties.filter(f => f.id !== id));
  };

  const handleEditFaculty = (id) => {
    const faculty = faculties.find(f => f.id === id);
    setEditingFacultyId(id);
    setEditFacultyData({ ...faculty });
  };

  const handleSaveEditFaculty = () => {
    if (editFacultyData.name && editFacultyData.departments) {
      setFaculties(faculties.map(f => 
        f.id === editingFacultyId 
          ? { 
              ...editFacultyData, 
              departments: parseInt(editFacultyData.departments) || 0,
              programs: parseInt(editFacultyData.programs) || 0
            }
          : f
      ));
      setEditingFacultyId(null);
      setEditFacultyData({});
    }
  };

  const handleCancelEditFaculty = () => {
    setEditingFacultyId(null);
    setEditFacultyData({});
  };

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col'>
      <Header />

      <main className='flex-grow'>
        {/* Dashboard Header */}
        <div className='bg-white border-b border-gray-200'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
            <h1 className='text-3xl font-bold text-gray-900'>Administration Dashboard</h1>
            <p className='text-gray-600 text-sm mt-1'>Manage timetables and schedules</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className='bg-white border-b border-gray-200'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <nav className='flex gap-12 text-sm font-medium'>
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 border-b-2 transition ${
                  activeTab === 'overview'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-700'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('timetables')}
                className={`py-4 border-b-2 transition ${
                  activeTab === 'timetables'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-700'
                }`}
              >
                Timetables
              </button>
              <button
                onClick={() => setActiveTab('faculty')}
                className={`py-4 border-b-2 transition ${
                  activeTab === 'faculty'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-700'
                }`}
              >
                Faculties & Departments
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 border-b-2 transition ${
                  activeTab === 'settings'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-700'
                }`}
              >
                Settings
              </button>
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <h2 className='text-xl font-bold text-gray-900 mb-6'>Dashboard Overview</h2>
              
              {/* Stats Cards - Clean */}
              <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8'>
                <div className='bg-white rounded-md border border-gray-200 p-6'>
                  <div className='text-sm text-gray-600 font-medium mb-2'>Total Faculties</div>
                  <div className='text-3xl font-bold text-gray-900'>5</div>
                  <div className='text-xs text-gray-500 mt-2'>Active</div>
                </div>
                <div className='bg-white rounded-md border border-gray-200 p-6'>
                  <div className='text-sm text-gray-600 font-medium mb-2'>Total Departments</div>
                  <div className='text-3xl font-bold text-gray-900'>18</div>
                  <div className='text-xs text-gray-500 mt-2'>All departments</div>
                </div>
                <div className='bg-white rounded-md border border-gray-200 p-6'>
                  <div className='text-sm text-gray-600 font-medium mb-2'>Programs</div>
                  <div className='text-3xl font-bold text-gray-900'>42</div>
                  <div className='text-xs text-gray-500 mt-2'>Active programs</div>
                </div>
                <div className='bg-white rounded-md border border-gray-200 p-6'>
                  <div className='text-sm text-gray-600 font-medium mb-2'>Last Update</div>
                  <div className='text-2xl font-bold text-gray-900'>Today</div>
                  <div className='text-xs text-gray-500 mt-2'>14:30</div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className='bg-white rounded-md border border-gray-200 p-6'>
                <h3 className='text-lg font-bold text-gray-900 mb-4'>Recent Timetables</h3>
                <div className='divide-y'>
                  {timetables.slice(0, 3).map((item) => (
                    <div key={item.id} className='py-4 flex justify-between items-center'>
                      <div>
                        <div className='font-medium text-gray-900'>{item.name}</div>
                        <div className='text-xs text-gray-500'>{item.faculty}</div>
                      </div>
                      <span className='text-xs px-2 py-1 rounded bg-gray-100 text-gray-700'>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Timetables Tab */}
          {activeTab === 'timetables' && (
            <div>
              <div className='flex justify-between items-center mb-6'>
                <h2 className='text-xl font-bold text-gray-900'>Manage Timetables</h2>
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
                  <h3 className='text-base font-semibold text-gray-900 mb-4'>New Timetable</h3>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <input
                      type='text'
                      placeholder='Name'
                      value={newTimetable.name}
                      onChange={(e) => setNewTimetable({...newTimetable, name: e.target.value})}
                      className='px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-600'
                    />
                    <input
                      type='text'
                      placeholder='Faculty'
                      value={newTimetable.faculty}
                      onChange={(e) => setNewTimetable({...newTimetable, faculty: e.target.value})}
                      className='px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-600'
                    />
                    <input
                      type='number'
                      placeholder='Number of Courses'
                      value={newTimetable.courses}
                      onChange={(e) => setNewTimetable({...newTimetable, courses: e.target.value})}
                      className='px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-600'
                    />
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
              <div className='bg-white rounded-md border border-gray-200 overflow-hidden'>
                <table className='w-full'>
                  <thead className='bg-gray-50 border-b'>
                    <tr>
                      <th className='px-6 py-3 text-left text-sm font-semibold text-gray-900'>Name</th>
                      <th className='px-6 py-3 text-left text-sm font-semibold text-gray-900'>Faculty</th>
                      <th className='px-6 py-3 text-left text-sm font-semibold text-gray-900'>Courses</th>
                      <th className='px-6 py-3 text-left text-sm font-semibold text-gray-900'>Status</th>
                      <th className='px-6 py-3 text-left text-sm font-semibold text-gray-900'>Actions</th>
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
                                value={editTimetableData.name}
                                onChange={(e) => setEditTimetableData({...editTimetableData, name: e.target.value})}
                                className='w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-600'
                              />
                            </td>
                            <td className='px-6 py-4 text-sm'>
                              <input
                                type='text'
                                value={editTimetableData.faculty}
                                onChange={(e) => setEditTimetableData({...editTimetableData, faculty: e.target.value})}
                                className='w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-600'
                              />
                            </td>
                            <td className='px-6 py-4 text-sm'>
                              <input
                                type='number'
                                value={editTimetableData.courses}
                                onChange={(e) => setEditTimetableData({...editTimetableData, courses: e.target.value})}
                                className='w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-600'
                              />
                            </td>
                            <td className='px-6 py-4 text-sm'>
                              <span className='bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs'>{editTimetableData.status}</span>
                            </td>
                            <td className='px-6 py-4 text-sm space-x-2'>
                              <button 
                                onClick={handleSaveEditTimetable}
                                className='text-green-600 hover:text-green-700 text-sm font-medium'
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
                            <td className='px-6 py-4 text-sm text-gray-900 font-medium'>{item.name}</td>
                            <td className='px-6 py-4 text-sm text-gray-600'>{item.faculty}</td>
                            <td className='px-6 py-4 text-sm text-gray-600'>{item.courses}</td>
                            <td className='px-6 py-4 text-sm'>
                              <span className='bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs'>{item.status}</span>
                            </td>
                            <td className='px-6 py-4 text-sm space-x-4'>
                              <button 
                                onClick={() => handleEditTimetable(item.id)}
                                className='text-blue-600 hover:text-blue-700 text-sm font-medium'
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteTimetable(item.id)}
                                className='text-red-600 hover:text-red-700 text-sm font-medium'
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
              </div>
            </div>
          )}

          {/* Faculty Tab */}
          {activeTab === 'faculty' && (
            <div>
              <div className='flex justify-between items-center mb-6'>
                <h2 className='text-xl font-bold text-gray-900'>Faculties & Departments</h2>
                <button 
                  onClick={() => setShowAddFacultyForm(!showAddFacultyForm)}
                  className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-sm font-medium'
                >
                  {showAddFacultyForm ? 'Cancel' : 'Add Faculty'}
                </button>
              </div>

              {/* Add Faculty Form */}
              {showAddFacultyForm && (
                <div className='bg-white rounded-md border border-gray-200 p-6 mb-6'>
                  <h3 className='text-base font-semibold text-gray-900 mb-4'>New Faculty</h3>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <input
                      type='text'
                      placeholder='Faculty Name'
                      value={newFaculty.name}
                      onChange={(e) => setNewFaculty({...newFaculty, name: e.target.value})}
                      className='px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-600'
                    />
                    <input
                      type='number'
                      placeholder='Number of Departments'
                      value={newFaculty.departments}
                      onChange={(e) => setNewFaculty({...newFaculty, departments: e.target.value})}
                      className='px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-600'
                    />
                    <input
                      type='number'
                      placeholder='Number of Programs'
                      value={newFaculty.programs}
                      onChange={(e) => setNewFaculty({...newFaculty, programs: e.target.value})}
                      className='px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-600'
                    />
                  </div>
                  <button 
                    onClick={handleAddFaculty}
                    className='mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-sm font-medium'
                  >
                    Save
                  </button>
                </div>
              )}

              {/* Faculties Table */}
              <div className='bg-white rounded-md border border-gray-200 overflow-hidden'>
                <table className='w-full'>
                  <thead className='bg-gray-50 border-b'>
                    <tr>
                      <th className='px-6 py-3 text-left text-sm font-semibold text-gray-900'>Name</th>
                      <th className='px-6 py-3 text-left text-sm font-semibold text-gray-900'>Departments</th>
                      <th className='px-6 py-3 text-left text-sm font-semibold text-gray-900'>Programs</th>
                      <th className='px-6 py-3 text-left text-sm font-semibold text-gray-900'>Actions</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y'>
                    {faculties.map((item) => (
                      <tr key={item.id} className='hover:bg-gray-50'>
                        {editingFacultyId === item.id ? (
                          <>
                            <td className='px-6 py-4 text-sm'>
                              <input
                                type='text'
                                value={editFacultyData.name}
                                onChange={(e) => setEditFacultyData({...editFacultyData, name: e.target.value})}
                                className='w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-600'
                              />
                            </td>
                            <td className='px-6 py-4 text-sm'>
                              <input
                                type='number'
                                value={editFacultyData.departments}
                                onChange={(e) => setEditFacultyData({...editFacultyData, departments: e.target.value})}
                                className='w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-600'
                              />
                            </td>
                            <td className='px-6 py-4 text-sm'>
                              <input
                                type='number'
                                value={editFacultyData.programs}
                                onChange={(e) => setEditFacultyData({...editFacultyData, programs: e.target.value})}
                                className='w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-600'
                              />
                            </td>
                            <td className='px-6 py-4 text-sm space-x-2'>
                              <button 
                                onClick={handleSaveEditFaculty}
                                className='text-green-600 hover:text-green-700 text-sm font-medium'
                              >
                                Save
                              </button>
                              <button 
                                onClick={handleCancelEditFaculty}
                                className='text-gray-600 hover:text-gray-700 text-sm font-medium'
                              >
                                Cancel
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className='px-6 py-4 text-sm text-gray-900 font-medium'>{item.name}</td>
                            <td className='px-6 py-4 text-sm text-gray-600'>{item.departments}</td>
                            <td className='px-6 py-4 text-sm text-gray-600'>{item.programs}</td>
                            <td className='px-6 py-4 text-sm space-x-4'>
                              <button 
                                onClick={() => handleEditFaculty(item.id)}
                                className='text-blue-600 hover:text-blue-700 text-sm font-medium'
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteFaculty(item.id)}
                                className='text-red-600 hover:text-red-700 text-sm font-medium'
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
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div>
              <h2 className='text-xl font-bold text-gray-900 mb-6'>Settings</h2>
              <div className='bg-white rounded-md border border-gray-200 p-6'>
                <p className='text-gray-600 text-sm'>Feature under development</p>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
