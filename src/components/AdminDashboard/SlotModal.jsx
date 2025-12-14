import React from 'react';

const SlotModal = ({
  showSlotModal,
  selectedTimetableId,
  handleCloseSlotModal,
  editingSlotId,
  newSlot,
  setNewSlot,
  timetables,
  courses,
  availableRooms,
  rooms,
  checkingAvailability,
  availableTeachers,
  teachers,
  error,
  handleAddSlot,
  isSubmitting,
}) => {
  if (!showSlotModal || !selectedTimetableId) {
    return null;
  }

  return (
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
                    object;
                    // Show ALL courses at this level (not just those with teachers)
                    const filteredCourses = levelId
                      ? courses.filter(
                          (c) => c.level_id && Number(c.level_id) === levelId,
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
                        No courses available for this level. Please add courses
                        for this level first.
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
  );
};

export default SlotModal;
