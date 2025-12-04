import React from 'react';
import { DAYS_OF_WEEK, TIME_SLOTS, COURSE_TYPES } from '../../constants';

const TimetableGrid = ({ schedule = [] }) => {
  const getCourseForSlot = (day, timeSlot) => {
    return schedule.find(
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
            {TIME_SLOTS.map((timeSlot) => (
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
