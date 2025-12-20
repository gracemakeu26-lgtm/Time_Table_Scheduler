import React, { useState, useMemo, useRef } from 'react';
import { Select } from '../common';
import CourseDetailModal from './CourseDetailModal';
import CourseSearch from './CourseSearch';
import { PrintIcon, DownloadIcon } from '../icons';
// import html2pdf from 'html2pdf.js';

// Map day numbers to day names (0=Monday, 6=Sunday)
const DAY_MAP = {
  0: 'Monday',
  1: 'Tuesday',
  2: 'Wednesday',
  3: 'Thursday',
  4: 'Friday',
  5: 'Saturday',
  6: 'Sunday',
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

const TimetableView = ({
  timetable,
  selectedDepartment,
  selectedLevel,
  selectedProgram,
  weeks,
}) => {
  const [selectedWeek, setSelectedWeek] = useState('week1');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const tableRef = useRef(null);

  // Transform backend slots to frontend format
  const allCourses = useMemo(() => {
    if (!timetable || !timetable.slots) return [];

    return timetable.slots.map((slot) => {
      // Use day_name from backend if available, otherwise map from day_of_week
      const dayName = slot.day_name || DAY_MAP[slot.day_of_week] || 'Monday';
      const timeSlot = formatTimeSlot(slot.start_time, slot.end_time);

      // Determine course type based on weekly_sessions or course name
      let courseType = 'Lecture';
      if (slot.course?.weekly_sessions > 1) {
        courseType = 'Lab Work';
      } else if (slot.course?.name?.toLowerCase().includes('tutorial')) {
        courseType = 'Tutorial';
      }

      return {
        id: slot.id,
        course: slot.course_name || slot.course?.name || 'Unknown Course',
        courseCode: slot.course_code || slot.course?.code || '',
        teacher: slot.teacher_name || slot.course?.teacher?.name || 'TBA',
        room: slot.room_name || slot.room?.name || 'TBA',
        roomType: slot.room_type || slot.room?.room_type || 'classroom',
        day: dayName,
        dayOfWeek: slot.day_of_week,
        time: timeSlot,
        startTime: slot.start_time,
        endTime: slot.end_time,
        type: courseType,
        courseData: slot.course,
        roomData: slot.room,
        notes: slot.notes,
      };
    });
  }, [timetable]);

  // Derive dynamic days from DB slots (sorted by day_of_week)
  const displayDays = useMemo(() => {
    if (!timetable?.slots?.length) {
      // Default to weekdays if no slots
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

    // Get unique days from slots
    const daySet = new Set(
      timetable.slots.map(
        (slot) => slot.day_name || DAY_MAP[slot.day_of_week] || 'Monday',
      ),
    );

    // Sort by day order
    return Array.from(daySet).sort(
      (a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b),
    );
  }, [timetable]);

  // Derive dynamic time rows from DB slots (sorted by start time)
  const displayTimes = useMemo(() => {
    if (!timetable?.slots?.length) {
      // Default time slots if no data
      return [
        '08:00 - 10:00',
        '10:00 - 12:00',
        '13:00 - 15:00',
        '15:00 - 17:00',
      ];
    }

    // Get unique time slots from actual data
    const timeSet = new Set(
      timetable.slots.map((s) => formatTimeSlot(s.start_time, s.end_time)),
    );

    // Sort by start time (convert to minutes for proper sorting)
    return Array.from(timeSet).sort((a, b) => {
      const startA = timeToMinutes(a.split(' - ')[0]);
      const startB = timeToMinutes(b.split(' - ')[0]);
      return startA - startB;
    });
  }, [timetable]);

  // Filter courses based on search term
  const filteredCourses = useMemo(() => {
    if (!searchTerm.trim()) return allCourses;
    return allCourses.filter(
      (course) =>
        course.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.teacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.room.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [allCourses, searchTerm]);

  // Track which courses match the filter
  const filteredCourseIds = new Set(
    filteredCourses.map((c) => `${c.day}-${c.time}`),
  );

  const getCourseForSlot = (day, timeSlot) => {
    return allCourses.find(
      (course) => course.day === day && course.time === timeSlot,
    );
  };

  const getCourseStyle = (type) => {
    switch (type) {
      case 'Lecture':
        return 'bg-blue-50 border-l-4 border-blue-600';
      case 'Lab Work':
        return 'bg-emerald-50 border-l-4 border-emerald-600';
      case 'Tutorial':
        return 'bg-indigo-50 border-l-4 border-indigo-600';
      default:
        return 'bg-gray-50 border-l-4 border-gray-400';
    }
  };

  const handlePrint = () => {
    // Use browser's native print with CSS media queries
    // The CSS will hide everything except the timetable
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!tableRef.current) return;

    try {
      // Dynamically import html2pdf only when needed
      const html2pdf = (await import('html2pdf.js')).default;

      const element = tableRef.current;
      const opt = {
        margin: [10, 10],
        filename: `timetable_${selectedProgram || 'timetable'}_${
          selectedWeek || 'current'
        }.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
        },
        jsPDF: {
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4',
        },
      };

      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <div>
      {/* Print Styles */}
      <style>
        {`
          @media print {
            @page {
              margin: 10mm;
              size: landscape;
            }
            body * {
              visibility: hidden;
            }
            .print-timetable, .print-timetable * {
              visibility: visible;
            }
            .print-timetable {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .no-print {
              display: none !important;
            }
          }
        `}
      </style>

      {/* Filters and Actions */}
      <div className='no-print flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6 justify-between items-stretch sm:items-center bg-gray-50 p-3 sm:p-4 md:p-6 rounded-lg'>
        <div className='flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 md:gap-4 flex-1'>
          {selectedProgram && (
            <div className='text-xs sm:text-sm text-gray-600 font-semibold bg-white px-3 sm:px-4 py-2 rounded-lg border border-gray-200'>
              Program: <span className='text-gray-900'>{selectedProgram}</span>
            </div>
          )}
          <div className='text-xs sm:text-sm text-gray-600 font-semibold bg-white px-3 sm:px-4 py-2 rounded-lg border border-gray-200'>
            Department:{' '}
            <span className='text-gray-900'>
              {selectedDepartment?.name || 'N/A'}
            </span>
          </div>
          <div className='text-xs sm:text-sm text-gray-600 font-semibold bg-white px-3 sm:px-4 py-2 rounded-lg border border-gray-200'>
            Level:{' '}
            <span className='text-gray-900'>
              {selectedLevel?.name || 'N/A'}
            </span>
          </div>
          {timetable && (
            <div className='text-xs sm:text-sm text-gray-600 font-semibold bg-white px-3 sm:px-4 py-2 rounded-lg border border-gray-200'>
              Timetable: <span className='text-gray-900'>{timetable.name}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className='flex flex-wrap gap-2 sm:gap-3'>
          <button
            onClick={handlePrint}
            className='flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-gray-900 text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors w-full sm:w-auto'
            title='Print'
          >
            <PrintIcon className='w-4 h-4 text-white' />
            <span className='hidden sm:inline'>Print</span>
          </button>
        </div>
      </div>

      {/* Desktop/Tablet Table View */}
      <div className='print-timetable hidden md:block overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm' ref={tableRef}>
        <div className='overflow-x-auto'>
          <table className='w-full divide-y divide-gray-200 border border-gray-300'>
            <thead className='bg-gray-900 text-white'>
              <tr>
                <th className='px-2 md:px-3 lg:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider border-r border-gray-300 whitespace-nowrap min-w-[80px]'>
                  Heure
                </th>
                {displayDays.map((day) => (
                  <th
                    key={day}
                    className='px-2 md:px-3 lg:px-4 py-2 md:py-3 text-center text-xs md:text-sm font-semibold text-white uppercase tracking-wider border-r border-gray-300'
                  >
                    <div className='font-extrabold text-xs md:text-sm'>{day}</div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {displayTimes.map((timeSlot) => (
                <tr key={timeSlot} className='hover:bg-gray-50 transition-colors'>
                  <td className='bg-gray-50 px-2 md:px-3 lg:px-4 py-2 md:py-3 text-center font-bold border-2 border-gray-300 text-gray-900 whitespace-nowrap text-xs md:text-sm'>
                    {timeSlot}
                  </td>
                  {displayDays.map((day) => {
                    const course = getCourseForSlot(day, timeSlot);
                    const courseId = `${day}-${timeSlot}`;
                    const isFiltered =
                      !searchTerm || filteredCourseIds.has(courseId);
                    return (
                      <td
                        key={courseId}
                        className={`border-2 border-gray-300 px-1 md:px-2 py-1 md:py-2 min-h-[100px] md:min-h-[120px] align-top transition-colors ${
                          isFiltered
                            ? 'bg-gray-50 hover:bg-gray-100'
                            : 'bg-gray-300 opacity-30'
                        }`}
                      >
                        {course && isFiltered ? (
                          <div
                            onClick={() => {
                              setSelectedCourse(course);
                              setIsModalOpen(true);
                            }}
                            className={`p-2 md:p-3 rounded-lg h-full cursor-pointer transform transition-all hover:scale-105 hover:shadow-lg ${getCourseStyle(
                              course.type,
                            )}`}
                          >
                            <div className='font-bold text-xs md:text-sm text-gray-900 mb-1 line-clamp-2'>
                              {course.course}
                            </div>
                            {course.courseCode && (
                              <div className='text-[10px] md:text-xs text-gray-600 mb-1 line-clamp-1'>
                                {course.courseCode}
                              </div>
                            )}
                            <div className='text-[10px] md:text-xs text-gray-700 mb-1 line-clamp-1'>
                              <span className='font-semibold text-gray-900'>
                                Teacher:
                              </span>{' '}
                              {course.teacher}
                            </div>
                            <div className='text-[10px] md:text-xs text-gray-700 mb-1 line-clamp-1'>
                              <span className='font-semibold text-gray-900'>
                                Room:
                              </span>{' '}
                              {course.room}
                            </div>
                          </div>
                        ) : !course && isFiltered ? (
                          <div className='text-gray-400 italic text-center text-xs h-full flex items-center justify-center'>
                            -
                          </div>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className='print-timetable md:hidden space-y-4'>
        {displayDays.map((day) => {
          const dayCourses = allCourses.filter((course) => course.day === day);
          const filteredDayCourses = dayCourses.filter((course) => {
            const courseId = `${course.day}-${course.time}`;
            return !searchTerm || filteredCourseIds.has(courseId);
          });

          if (filteredDayCourses.length === 0 && searchTerm) {
            return null;
          }

          return (
            <div
              key={day}
              className='bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden'
            >
              <div className='bg-gray-900 text-white px-4 py-3'>
                <h3 className='text-base font-bold text-center'>{day}</h3>
              </div>
              <div className='divide-y divide-gray-200'>
                {displayTimes.map((timeSlot) => {
                  const course = getCourseForSlot(day, timeSlot);
                  const courseId = `${day}-${timeSlot}`;
                  const isFiltered =
                    !searchTerm || filteredCourseIds.has(courseId);

                  if (!isFiltered) return null;

                  return (
                    <div
                      key={courseId}
                      className={`px-4 py-3 ${
                        course
                          ? 'hover:bg-gray-50 transition-colors cursor-pointer'
                          : 'bg-gray-50'
                      }`}
                      onClick={() => {
                        if (course) {
                          setSelectedCourse(course);
                          setIsModalOpen(true);
                        }
                      }}
                    >
                      <div className='flex items-start justify-between gap-3'>
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-center gap-2 mb-2'>
                            <span className='text-sm font-bold text-gray-900 whitespace-nowrap'>
                              {timeSlot}
                            </span>
                          </div>
                          {course ? (
                            <div
                              className={`p-3 rounded-lg ${getCourseStyle(
                                course.type,
                              )}`}
                            >
                              <div className='font-bold text-sm text-gray-900 mb-1'>
                                {course.course}
                              </div>
                              {course.courseCode && (
                                <div className='text-xs text-gray-600 mb-2'>
                                  {course.courseCode}
                                </div>
                              )}
                              <div className='space-y-1'>
                                <div className='text-xs text-gray-700'>
                                  <span className='font-semibold text-gray-900'>
                                    Teacher:
                                  </span>{' '}
                                  {course.teacher}
                                </div>
                                <div className='text-xs text-gray-700'>
                                  <span className='font-semibold text-gray-900'>
                                    Room:
                                  </span>{' '}
                                  {course.room}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className='text-gray-400 italic text-sm text-center py-2'>
                              No class scheduled
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Course Detail Modal */}
      {selectedCourse && (
        <CourseDetailModal
          course={selectedCourse}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedCourse(null);
          }}
        />
      )}
    </div>
  );
};

export default TimetableView;
