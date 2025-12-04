import React, { useState, useMemo, useRef } from 'react';
import { Select } from '../common';
import { DAYS_OF_WEEK, TIME_SLOTS } from '../../constants';
import { timetableData } from '../../data/timetableData';
import CourseDetailModal from './CourseDetailModal';
import CourseSearch from './CourseSearch';
import { PrintIcon, DownloadIcon } from '../icons';
// import html2pdf from 'html2pdf.js';

const TimetableView = ({ selectedProgram, departments, weeks }) => {
  const [selectedWeek, setSelectedWeek] = useState('week1');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const tableRef = useRef(null);

  // Get all courses for the selected program and week
  const allCourses = useMemo(() => {
    if (!selectedProgram || !timetableData[selectedProgram]) return [];
    return timetableData[selectedProgram][selectedWeek] || [];
  }, [selectedProgram, selectedWeek]);

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
    if (!selectedProgram || !timetableData[selectedProgram]) return null;

    const weekData = timetableData[selectedProgram][selectedWeek];
    return weekData?.find(
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
    window.print();
  };

  const handleDownloadPDF = () => {
    if (!tableRef.current) return;

    const element = tableRef.current;
    const opt = {
      margin: 10,
      filename: `timetable_${selectedProgram}_${selectedWeek}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'landscape', unit: 'mm', format: 'a4' },
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <div>
      {/* Filters */}
      <div className='flex flex-wrap gap-4 mb-8 justify-start'>
        <Select
          placeholder='Départements'
          options={departments}
          className='min-w-[200px]'
        />
        <Select
          placeholder='Niveau'
          options={[
            { id: '1', name: 'Licence 1' },
            { id: '2', name: 'Licence 2' },
            { id: '3', name: 'Licence 3' },
            { id: '4', name: 'Master 1' },
            { id: '5', name: 'Master 2' },
          ]}
          className='min-w-[200px]'
        />
        <Select
          placeholder='Semaine'
          options={weeks}
          className='min-w-[200px]'
        />
      </div>

      {/* Filters and Actions */}
      <div className='flex flex-wrap gap-4 mb-8 justify-between bg-linear-to-r from-blue-50 to-purple-50 p-6 rounded-lg'>
        <div className='flex flex-wrap gap-4'>
          <div className='flex-1 min-w-[200px]'>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>
              Week
            </label>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className='w-full px-4 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-600 transition-colors'
            >
              <option value='week1'>Week 1</option>
              <option value='week2'>Week 2</option>
              <option value='week3'>Week 3</option>
              <option value='week4'>Week 4</option>
            </select>
          </div>
          <div className='flex items-end'>
            <div className='text-sm text-gray-600 font-semibold bg-white px-4 py-2 rounded-lg border border-gray-200'>
              Program: <span className='text-blue-600'>{selectedProgram}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex flex-wrap gap-3'>
          <button
            onClick={handlePrint}
            className='flex items-center gap-2 px-4 py-2 bg-white border-2 border-blue-300 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors'
            title='Print'
          >
            <PrintIcon className='w-4 h-4' />
            <span className='hidden sm:inline'>Print</span>
          </button>
          <button
            onClick={handleDownloadPDF}
            className='flex items-center gap-2 px-4 py-2 bg-white border-2 border-red-300 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-colors'
            title='Download as PDF'
          >
            <DownloadIcon className='w-4 h-4' />
            <span className='hidden sm:inline'>PDF</span>
          </button>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className='overflow-x-auto bg-white'>
        <table className='min-w-full divide-y divide-gray-200 border border-gray-300'>
          <thead className='bg-blue-500 text-white'>
            <tr>
              <th className='px-3 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider border-r border-gray-300 w-1/12'>
                Heure
              </th>
              {DAYS_OF_WEEK.map((day) => (
                <th
                  key={day}
                  className='px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider border-r border-gray-300 w-1/5'
                >
                  <div className='font-extrabold text-sm'>{day}</div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {TIME_SLOTS.map((timeSlot) => (
              <tr key={timeSlot} className='hover:bg-blue-50 transition-colors'>
                <td className='bg-linear-to-r from-gray-200 to-gray-100 p-4 text-center font-bold border-2 border-gray-300 text-gray-800 whitespace-nowrap'>
                  {timeSlot}
                </td>
                {DAYS_OF_WEEK.map((day) => {
                  const course = getCourseForSlot(day, timeSlot);
                  const courseId = `${day}-${timeSlot}`;
                  const isFiltered =
                    !searchTerm || filteredCourseIds.has(courseId);
                  return (
                    <td
                      key={courseId}
                      className={`border-2 border-gray-300 p-2 min-h-[120px] align-top transition-colors ${
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
                          className={`p-3 rounded-lg h-full cursor-pointer transform transition-all hover:scale-105 hover:shadow-lg ${getCourseStyle(
                            course.type,
                          )}`}
                        >
                          <div className='font-bold text-sm text-gray-900 mb-1 line-clamp-2'>
                            {course.course}
                          </div>
                          <div className='text-xs text-gray-700 mb-1 line-clamp-1'>
                            <span className='font-semibold'>Teacher:</span>{' '}
                            {course.teacher.split(' ')[0]}
                          </div>
                          <div className='text-xs text-gray-700 mb-1 line-clamp-1'>
                            <span className='font-semibold'>Room:</span>{' '}
                            {course.room}
                          </div>
                        </div>
                      ) : !course && isFiltered ? (
                        <div className='text-gray-400 italic text-center text-sm h-full flex items-center justify-center'>
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

      {/* Legend */}
      <div className='mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
        <div className='flex items-center gap-2 p-3 bg-blue-100 rounded-lg border-l-4 border-blue-600'>
          <div className='w-4 h-4 bg-blue-600 rounded'></div>
          <span className='text-sm text-blue-900'>Lecture</span>
        </div>
        <div className='flex items-center gap-2 p-3 bg-emerald-100 rounded-lg border-l-4 border-emerald-600'>
          <div className='w-4 h-4 bg-emerald-600 rounded'></div>
          <span className='text-sm text-emerald-900'>Lab Work</span>
        </div>
        <div className='flex items-center gap-2 p-3 bg-indigo-100 rounded-lg border-l-4 border-indigo-600'>
          <div className='w-4 h-4 bg-indigo-600 rounded'></div>
          <span className='text-sm text-indigo-900'>Tutorial</span>
        </div>
      </div>

      {/* Course Detail Modal */}
      <CourseDetailModal
        course={selectedCourse}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCourse(null);
        }}
      />
    </div>
  );
};

export default TimetableView;
