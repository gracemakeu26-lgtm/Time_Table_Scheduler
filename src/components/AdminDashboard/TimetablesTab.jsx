import React from 'react';

const TimetablesTab = ({
  timetables,
  departments,
  levels,
  showAddForm,
  setShowAddForm,
  newTimetable,
  setNewTimetable,
  handleAddTimetable,
  isSubmitting,
  setError,
  selectedTimetableId,
  handleEditTimetable,
  handleSelectTimetable,
  handleDeleteTimetable,
  loadingSlots,
  slots,
  handleOpenSlotModal,
  dayNumberToName,
  handleDeleteSlot,
}) => {
  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-xl font-bold text-gray-900'>Manage Timetables</h2>
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
                Timetable Name <span className='text-red-500'>*</span>
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
                Week Start Date <span className='text-red-500'>*</span>
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

      {/* Timetables Display */}
      <div className='bg-white/10 backdrop-blur-3xl rounded-md overflow-hidden'>
        {timetables.length === 0 ? (
          <div className='p-8 text-center text-gray-400'>
            No timetables found
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className='hidden lg:block'>
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
                        {departments.find((d) => d.id === item.department_id)
                          ?.name || 'N/A'}
                      </td>
                      <td className='px-6 py-4 text-sm text-gray-600'>
                        {item.level_name ||
                          levels.find((l) => l.id === item.level_id)?.name ||
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
                            onClick={() => handleEditTimetable(item.id)}
                            className='text-gray-900 hover:text-gray-700 text-sm font-medium hover:underline'
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleSelectTimetable(item.id)}
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
                            onClick={() => handleDeleteTimetable(item.id)}
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

            {/* Mobile & Tablet Card View */}
            <div className='lg:hidden space-y-4 p-4'>
              {timetables.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow ${
                    selectedTimetableId === item.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className='flex items-start justify-between mb-3'>
                    <div className='flex-1'>
                      <h3 className='text-base font-semibold text-gray-900 mb-1'>
                        {item.name}
                      </h3>
                      <div className='flex items-center gap-2 mb-2'>
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
                        {selectedTimetableId === item.id && (
                          <span className='px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700'>
                            Currently Selected
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4'>
                    <div>
                      <dt className='text-xs font-medium text-gray-500 uppercase tracking-wide'>
                        Department
                      </dt>
                      <dd className='text-sm text-gray-900 mt-1'>
                        {departments.find((d) => d.id === item.department_id)
                          ?.name || 'N/A'}
                      </dd>
                    </div>
                    <div>
                      <dt className='text-xs font-medium text-gray-500 uppercase tracking-wide'>
                        Level
                      </dt>
                      <dd className='text-sm text-gray-900 mt-1'>
                        {item.level_name ||
                          levels.find((l) => l.id === item.level_id)?.name ||
                          'N/A'}
                      </dd>
                    </div>
                    <div className='sm:col-span-2'>
                      <dt className='text-xs font-medium text-gray-500 uppercase tracking-wide'>
                        Academic Year
                      </dt>
                      <dd className='text-sm text-gray-900 mt-1'>
                        {item.academic_year || 'N/A'}
                      </dd>
                    </div>
                  </div>

                  <div className='flex flex-wrap gap-2 pt-3 border-t border-gray-100'>
                    <button
                      onClick={() => handleEditTimetable(item.id)}
                      className='flex-1 sm:flex-none px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors'
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleSelectTimetable(item.id)}
                      className={`flex-1 sm:flex-none px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        selectedTimetableId === item.id
                          ? 'text-green-700 bg-green-100 hover:bg-green-200'
                          : 'text-blue-700 bg-blue-100 hover:bg-blue-200'
                      }`}
                    >
                      {selectedTimetableId === item.id
                        ? 'Selected'
                        : 'Manage Slots'}
                    </button>
                    <button
                      onClick={() => handleDeleteTimetable(item.id)}
                      className='px-3 py-2 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors'
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Slots Management Panel */}
      {selectedTimetableId && (
        <div className='mt-8 bg-white rounded-lg border border-gray-200 shadow-md p-4 sm:p-6'>
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6'>
            <div className='flex-1'>
              <h3 className='text-lg font-bold text-gray-900'>Manage Slots</h3>
              <p className='text-sm text-gray-600 mt-1'>
                Timetable:{' '}
                <span className='font-medium'>
                  {timetables.find((t) => t.id === selectedTimetableId)?.name ||
                    `#${selectedTimetableId}`}
                </span>
              </p>
            </div>
            <button
              onClick={() => handleOpenSlotModal()}
              className='w-full sm:w-auto bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition text-sm font-medium flex items-center justify-center gap-2'
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
              <p className='text-gray-500 mb-4'>No slots have been added yet</p>
              <button
                onClick={() => handleOpenSlotModal()}
                className='bg-gray-900 text-white px-6 py-2 rounded-md hover:bg-gray-800 transition text-sm font-medium'
              >
                Add First Slot
              </button>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className='hidden lg:block bg-white rounded-lg border border-gray-200 overflow-hidden'>
                <div className='overflow-x-auto'>
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
                            {s.room?.name || s.room?.code || s.room_name || (
                              <span className='text-gray-400 italic'>
                                Not assigned
                              </span>
                            )}
                          </td>
                          <td className='px-6 py-4 text-sm text-gray-700'>
                            {s.teacher?.name ||
                              s.teacher?.full_name ||
                              (s.teacher?.first_name && s.teacher?.last_name
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
              </div>

              {/* Mobile & Tablet Card View */}
              <div className='lg:hidden space-y-4'>
                {slots.map((s) => (
                  <div
                    key={s.id}
                    className='bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow'
                  >
                    <div className='flex items-start justify-between mb-3'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2 mb-1'>
                          <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800'>
                            {s.day_name ||
                              dayNumberToName(s.day_of_week) ||
                              'N/A'}
                          </span>
                          <span className='text-sm font-medium text-gray-900'>
                            {s.start_time && s.end_time
                              ? `${s.start_time} - ${s.end_time}`
                              : 'No time set'}
                          </span>
                        </div>
                        <h4 className='text-base font-semibold text-gray-900'>
                          {s.course?.code || 'No Course'}
                        </h4>
                        {s.course?.name && (
                          <p className='text-sm text-gray-600 mt-1'>
                            {s.course.name}
                          </p>
                        )}
                      </div>
                      <div className='flex flex-col sm:flex-row gap-2 ml-4'>
                        <button
                          onClick={() => handleOpenSlotModal(s)}
                          className='px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors'
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSlot(s.id)}
                          className='px-3 py-1 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors'
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-gray-100'>
                      <div>
                        <dt className='text-xs font-medium text-gray-500 uppercase tracking-wide'>
                          Room
                        </dt>
                        <dd className='text-sm text-gray-900 mt-1'>
                          {s.room?.name || s.room?.code || s.room_name || (
                            <span className='text-gray-400 italic'>
                              Not assigned
                            </span>
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt className='text-xs font-medium text-gray-500 uppercase tracking-wide'>
                          Teacher
                        </dt>
                        <dd className='text-sm text-gray-900 mt-1'>
                          {s.teacher?.name ||
                            s.teacher?.full_name ||
                            (s.teacher?.first_name && s.teacher?.last_name
                              ? `${s.teacher.first_name} ${s.teacher.last_name}`
                              : s.teacher_name) || (
                              <span className='text-gray-400 italic'>
                                Not assigned
                              </span>
                            )}
                        </dd>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TimetablesTab;
