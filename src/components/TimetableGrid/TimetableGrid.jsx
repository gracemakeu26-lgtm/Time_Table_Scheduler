import React, { useMemo } from 'react';
import { COURSE_TYPES } from '../../constants';

// Map numeric day (0=Mon) to name
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

// Convert time to time slot format (handles both string and time objects)
const formatTimeSlot = (startTime, endTime) => {
  // If already formatted strings, return as is
  if (typeof startTime === 'string' && typeof endTime === 'string') {
    return `${startTime} - ${endTime}`;
  }
  // If time objects, format them
  if (startTime && endTime) {
    const start =
      typeof startTime === 'string'
        ? startTime
        : startTime.toString().slice(0, 5);
    const end =
      typeof endTime === 'string' ? endTime : endTime.toString().slice(0, 5);
    return `${start} - ${end}`;
  }
  return 'TBA';
};

// Parse time string to minutes for sorting
const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + (minutes || 0);
};

// Normalize backend slots -> schedule items the grid understands
const normalizeSlots = (slots = []) => {
  return slots.map((slot) => {
    // Use day_name from backend if available, otherwise map from day_of_week
    const dayName =
      slot.day_name ||
      (typeof slot.day_of_week === 'number'
        ? dayIndexToName(slot.day_of_week)
        : slot.day_of_week || 'Monday');

    const time = formatTimeSlot(slot.start_time, slot.end_time);

    // Get course data - backend provides course_name and course_code directly
    const courseName = slot.course_name || slot.course?.name || 'Course';
    const courseCode = slot.course_code || slot.course?.code || '';

    // Get teacher data - backend provides teacher_name directly
    const teacherName =
      slot.teacher_name ||
      slot.course?.teacher?.name ||
      slot.teacher?.name ||
      slot.teacher?.full_name ||
      `${slot.teacher?.first_name || ''} ${
        slot.teacher?.last_name || ''
      }`.trim() ||
      'TBA';

    // Get room data - backend provides room_name directly
    const roomName =
      slot.room_name || slot.room?.name || slot.room?.code || 'TBA';

    // Determine course type
    const weekly = slot.course?.weekly_sessions;
    let type = COURSE_TYPES.LECTURE;
    if (weekly && weekly > 1) {
      type = COURSE_TYPES.LAB;
    } else if (courseName.toLowerCase().includes('tutorial')) {
      type = COURSE_TYPES.TUTORIAL;
    }

    return {
      id: slot.id,
      day: dayName,
      dayOfWeek: slot.day_of_week,
      time,
      startTime: slot.start_time,
      endTime: slot.end_time,
      course: courseName,
      courseCode: courseCode,
      teacher: teacherName,
      room: roomName,
      type,
      courseData: slot.course,
      roomData: slot.room,
      notes: slot.notes,
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

  // Derive dynamic days from schedule data
  const displayDays = useMemo(() => {
    if (derivedSchedule.length === 0) {
      return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    }

    const dayOrder = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];

    const daySet = new Set(derivedSchedule.map((c) => c.day));
    return Array.from(daySet).sort(
      (a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b),
    );
  }, [derivedSchedule]);

  // Derive dynamic time slots from schedule data (sorted by start time)
  const displaySlots = useMemo(() => {
    const times = Array.from(new Set(derivedSchedule.map((c) => c.time)));
    if (times.length > 0) {
      // Sort by start time (convert to minutes for proper sorting)
      return times.sort((a, b) => {
        const startA = timeToMinutes(a.split(' - ')[0]);
        const startB = timeToMinutes(b.split(' - ')[0]);
        return startA - startB;
      });
    }
    // Default time slots if no data
    return ['08:00 - 10:00', '10:00 - 12:00', '13:00 - 15:00', '15:00 - 17:00'];
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
              {displayDays.map((day) => (
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
                {displayDays.map((day) => {
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
                          {course.courseCode && (
                            <div className='text-xs text-gray-500 italic'>
                              {course.courseCode}
                            </div>
                          )}
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
