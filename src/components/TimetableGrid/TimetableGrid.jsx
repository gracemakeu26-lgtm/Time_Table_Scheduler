import React, { useMemo } from 'react';
import { DAYS_OF_WEEK, TIME_SLOTS, COURSE_TYPES } from '../../constants';

// Map numeric day (0=Mon) to name from constants
const dayIndexToName = (idx) => {
  const names = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];
  return names[idx] || 'Monday';
};

// Normalize backend slots -> schedule items the grid understands
const normalizeSlots = (slots = []) => {
  return slots.map((slot) => {
    const dayName =
      typeof slot.day_of_week === 'number'
        ? dayIndexToName(slot.day_of_week)
        : slot.day_of_week || 'Monday';
    const time = `${slot.start_time} - ${slot.end_time}`;
    const courseObj = slot.course || {};
    const teacherObj = courseObj.teacher || slot.teacher || {};
    const roomObj = slot.room || {};
    const weekly = courseObj.weekly_sessions;
    const type = weekly && weekly > 1 ? COURSE_TYPES.LAB : COURSE_TYPES.LECTURE;
    return {
      id: slot.id,
      day: dayName,
      time,
      course: courseObj.name || courseObj.code || 'Course',
      teacher:
        teacherObj.name ||
        teacherObj.full_name ||
        `${teacherObj.first_name || ''} ${teacherObj.last_name || ''}`.trim() ||
        'TBA',
      room: roomObj.name || roomObj.code || 'TBA',
      type,
    };
  });
};

const TimetableGrid = ({ schedule = [], timetable = null, slots = null }) => {
  const derivedSchedule = useMemo(() => {
    if (Array.isArray(schedule) && schedule.length > 0) return schedule;
    const srcSlots = Array.isArray(slots)
      ? slots
      : Array.isArray(timetable?.slots)
      ? timetable.slots
      : [];
    return normalizeSlots(srcSlots);
  }, [schedule, timetable, slots]);

  const displaySlots = useMemo(() => {
    const times = Array.from(new Set(derivedSchedule.map((c) => c.time)));
    if (times.length > 0) {
      return times.sort();
    }
    return TIME_SLOTS;
  }, [derivedSchedule]);

  const getCourseForSlot = (day, timeSlot) => {
    return derivedSchedule.find(
      (course) => course.day === day && course.time === timeSlot,
    );
  };

  const getCourseStyle = (type) => {
    switch (type) {
      case COURSE_TYPES.LECTURE:
        return 'bg-linear-to-br from-blue-100 to-blue-200 border-2 border-blue-400 shadow-md';
      case COURSE_TYPES.LAB:
        return 'bg-linear-to-br from-green-100 to-green-200 border-2 border-green-400 shadow-md';
      case COURSE_TYPES.TUTORIAL:
        return 'bg-linear-to-br from-purple-100 to-purple-200 border-2 border-purple-400 shadow-md';
      default:
        return 'bg-linear-to-br from-gray-100 to-gray-200 border-2 border-gray-300 shadow-md';
    }
  };

  return (
    <div className='overflow-x-auto rounded-lg shadow-lg'>
      <div className='min-w-[800px]'>
        <table className='w-full border-collapse'>
          {/* Header */}
          <thead>
            <tr>
              <th className='gradient-primary text-white p-4 text-center font-bold border-2 border-gray-300'></th>
              {DAYS_OF_WEEK.map((day) => (
                <th
                  key={day}
                  className='bg-linear-to-br from-blue-600 to-purple-600 text-white p-4 text-center font-bold border-2 border-gray-300'
                >
                  <div className='font-extrabold text-sm'>{day}</div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {displaySlots.map((timeSlot) => (
              <tr key={timeSlot}>
                <td className='bg-linear-to-r from-gray-200 to-gray-100 p-4 text-center font-bold border-2 border-gray-300 whitespace-nowrap text-gray-800'>
                  {timeSlot}
                </td>
                {DAYS_OF_WEEK.map((day) => {
                  const course = getCourseForSlot(day, timeSlot);
                  return (
                    <td
                      key={`${day}-${timeSlot}`}
                      className='border border-gray-300 p-2 min-h-[100px] align-top'
                    >
                      {course ? (
                        <div
                          className={`p-2 rounded border ${getCourseStyle(
                            course.type,
                          )}`}
                        >
                          <div className='font-semibold text-sm'>
                            {course.course}
                          </div>
                          <div className='text-xs text-gray-600'>
                            {course.teacher}
                          </div>
                          <div className='text-xs text-green-600'>
                            {course.room}
                          </div>
                          <div className='text-xs text-gray-500 italic'>
                            {course.type}
                          </div>
                        </div>
                      ) : (
                        <div className='text-gray-400 italic text-center text-sm'>
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
};

export default TimetableGrid;
