import React from 'react';

const EditTimetableModal = ({
  showEditModal,
  editingTimetableId,
  handleCancelEditTimetable,
  editTimetableData,
  setEditTimetableData,
  departments,
  levels,
  handleSaveEditTimetable,
  isSubmitting,
}) => {
  if (!showEditModal || !editingTimetableId) {
    return null;
  }

  return (
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
  );
};

export default EditTimetableModal;
