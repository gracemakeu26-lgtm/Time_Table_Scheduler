import React from 'react';
import { DAY_MAP } from '../../constants/adminDashboard';

const TimetableViewTab = ({
  selectedSemester,
  setSelectedSemester,
  availableSemesters,
  selectedYear,
  setSelectedYear,
  availableYears,
  selectedDepartmentView,
  setSelectedDepartmentView,
  departments,
  selectedLevelView,
  setSelectedLevelView,
  levels,
  viewMode,
  setViewMode,
  clashes,
  filteredTimetables,
  allSlots,
  groupedSlots,
  displayDays,
  displayTimes,
  formatTimeSlot,
  hasClash,
  getClashDetails,
  timetablesWithSlots,
  loadingTimetablesWithSlots,
}) => {
  return (
    <div className='w-full'>
      <h2 className='text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6'>
        Timetable View - Clash Detection
      </h2>

      {/* Filters */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4 mb-4 md:mb-6 p-3 md:p-4 bg-gray-50 rounded-lg overflow-visible'>
        <div className='relative z-10'>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Semester
          </label>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-900 relative z-20'
          >
            <option value=''>All Semesters</option>
            {availableSemesters.map((sem) => (
              <option key={sem} value={sem}>
                {sem}
              </option>
            ))}
          </select>
        </div>

        <div className='relative z-10'>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Academic Year
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-900 relative z-20'
          >
            <option value=''>All Years</option>
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className='relative z-10'>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Department
          </label>
          <select
            value={selectedDepartmentView}
            onChange={(e) => setSelectedDepartmentView(e.target.value)}
            className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-900 relative z-20'
          >
            <option value=''>All Departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        <div className='relative z-10'>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Level
          </label>
          <select
            value={selectedLevelView}
            onChange={(e) => setSelectedLevelView(e.target.value)}
            className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-900 relative z-20'
          >
            <option value=''>All Levels</option>
            {levels.map((level) => (
              <option key={level.id} value={level.id}>
                {level.code} - {level.name}
              </option>
            ))}
          </select>
        </div>

        <div className='relative z-10'>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            View Mode
          </label>
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-900 relative z-20'
          >
            <option value='level'>By Level</option>
            <option value='department'>By Department</option>
            <option value='room'>By Room</option>
          </select>
        </div>
      </div>

      {/* Clash Summary */}
      {clashes.length > 0 && (
        <div className='mb-4 md:mb-6 p-4 md:p-6 bg-red-50 border-2 border-red-300 rounded-lg'>
          <h3 className='text-lg md:text-xl font-bold text-red-800 mb-3 md:mb-4'>
            Clashes Detected: {clashes.length}
          </h3>
          <div className='space-y-3 md:space-y-4 max-h-80 md:max-h-96 overflow-y-auto'>
            {clashes.map((clash, idx) => {
              const clashKey =
                clash.slot1?.id && clash.slot2?.id
                  ? `clash-${clash.type}-${clash.slot1.id}-${clash.slot2.id}`
                  : `clash-${clash.type}-${idx}-${Date.now()}`;
              return (
                <div
                  key={clashKey}
                  className='bg-white p-3 md:p-4 rounded-lg border border-red-300 shadow-sm'
                >
                  <div className='font-bold text-red-700 mb-2 text-sm md:text-base'>
                    Clash #{idx + 1}:{' '}
                    {clash.type === 'room' ? 'Room Clash' : 'Teacher Clash'}
                  </div>
                  <div className='grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm'>
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
                          <span className='font-medium'>Day:</span> {clash.day}
                        </div>
                      </div>
                    </div>
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
                          <span className='font-medium'>Day:</span> {clash.day}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='mt-3 pt-3 border-t border-gray-300'>
                    <div className='text-xs md:text-sm font-semibold text-red-800'>
                      Conflict Details:
                    </div>
                    <div className='text-xs md:text-sm text-gray-700 leading-relaxed'>
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
      <div className='grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6'>
        <div className='bg-blue-50 p-3 md:p-4 rounded-lg border border-blue-200'>
          <div className='text-xs md:text-sm text-blue-600 font-medium'>
            Total Timetables
          </div>
          <div className='text-xl md:text-2xl font-bold text-blue-900'>
            {filteredTimetables.length}
          </div>
        </div>
        <div className='bg-green-50 p-3 md:p-4 rounded-lg border border-green-200'>
          <div className='text-xs md:text-sm text-green-600 font-medium'>
            Total Slots
          </div>
          <div className='text-xl md:text-2xl font-bold text-green-900'>
            {allSlots.length}
          </div>
        </div>
        <div className='bg-red-50 p-3 md:p-4 rounded-lg border border-red-200'>
          <div className='text-xs md:text-sm text-red-600 font-medium'>
            Clashes
          </div>
          <div className='text-xl md:text-2xl font-bold text-red-900'>
            {clashes.length}
          </div>
        </div>
        <div className='bg-purple-50 p-3 md:p-4 rounded-lg border border-purple-200'>
          <div className='text-xs md:text-sm text-purple-600 font-medium'>
            Groups
          </div>
          <div className='text-xl md:text-2xl font-bold text-purple-900'>
            {groupedSlots.size}
          </div>
        </div>
      </div>

      {/* Grouped Timetable View */}
      <div className='space-y-4 md:space-y-8'>
        {Array.from(groupedSlots.entries()).map(
          ([groupName, slots], groupIdx) => {
            const groupKey = `${viewMode}-${groupName}-${groupIdx}`;
            return (
              <div
                key={groupKey}
                className='border border-gray-200 rounded-lg p-3 md:p-4 bg-white'
              >
                <h3 className='text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4 wrap-break-words'>
                  {viewMode === 'level' && 'Level: '}
                  {viewMode === 'department' && 'Department: '}
                  {viewMode === 'room' && 'Room: '}
                  {groupName}
                </h3>

                {/* Timetable Grid */}
                <div className='overflow-x-auto -mx-3 md:mx-0 min-w-full w-full'>
                  <table
                    className='w-full border-collapse border border-gray-300'
                    style={{ minWidth: '100%' }}
                  >
                    <thead>
                      <tr className='bg-gray-900 text-white'>
                        <th className='border border-gray-300 px-2 md:px-4 py-2 text-left text-xs md:text-sm font-medium'>
                          Time
                        </th>
                        {displayDays.map((day, dayIdx) => (
                          <th
                            key={`day-${day}-${dayIdx}`}
                            className='border border-gray-300 px-2 md:px-4 py-2 text-center text-xs md:text-sm font-medium'
                          >
                            {DAY_MAP[day]}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {displayTimes.map((timeSlot, timeIdx) => (
                        <tr key={`time-${timeSlot}-${timeIdx}`}>
                          <td className='border border-gray-300 px-2 md:px-4 py-2 font-semibold bg-gray-50 text-xs md:text-sm whitespace-nowrap'>
                            {timeSlot}
                          </td>
                          {displayDays.map((day, dayIdx) => {
                            const dayTimeSlots = slots.filter(
                              (s) =>
                                s.day_of_week === day &&
                                formatTimeSlot(s.start_time, s.end_time) ===
                                  timeSlot,
                            );

                            return (
                              <td
                                key={`cell-${day}-${dayIdx}-${timeSlot}-${timeIdx}`}
                                className={`border border-gray-300 px-1 md:px-2 py-1 align-top min-w-0 ${
                                  dayTimeSlots.some((s) => hasClash(s))
                                    ? 'bg-red-100'
                                    : 'bg-white'
                                }`}
                              >
                                {dayTimeSlots.length > 0 ? (
                                  <div className='space-y-1'>
                                    {dayTimeSlots.map((slot, slotIdx) => {
                                      const clash = hasClash(slot);
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
                                          className={`p-1 md:p-2 rounded text-xs ${
                                            clash
                                              ? 'bg-red-200 border-2 border-red-500'
                                              : 'bg-blue-50 border border-blue-200'
                                          }`}
                                          title={
                                            clash
                                              ? `CLASH: ${getClashDetails(slot)
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
                                          <div
                                            className='font-semibold text-xs truncate'
                                            title={
                                              slot.course_name ||
                                              slot.course?.name ||
                                              'Unknown'
                                            }
                                          >
                                            {slot.course_name ||
                                              slot.course?.name ||
                                              'Unknown'}
                                          </div>
                                          {(slot.course_code ||
                                            slot.course?.code) && (
                                            <div
                                              className='text-xs text-gray-600 truncate'
                                              title={
                                                slot.course_code ||
                                                slot.course?.code
                                              }
                                            >
                                              {slot.course_code ||
                                                slot.course?.code}
                                            </div>
                                          )}
                                          <div
                                            className='text-xs text-gray-700 truncate'
                                            title={`Teacher: ${
                                              slot.teacher_name || 'TBA'
                                            }`}
                                          >
                                            Teacher:{' '}
                                            {slot.teacher_name || 'TBA'}
                                          </div>
                                          <div
                                            className='text-xs text-green-700 truncate'
                                            title={`Room: ${
                                              slot.room_name || 'Unknown'
                                            }`}
                                          >
                                            Room: {slot.room_name || 'Unknown'}
                                          </div>
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

      {loadingTimetablesWithSlots ? (
        <div className='text-center py-12 text-gray-600'>
          Loading timetables...
        </div>
      ) : groupedSlots.size === 0 && timetablesWithSlots.length > 0 ? (
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
  );
};

export default TimetableViewTab;
