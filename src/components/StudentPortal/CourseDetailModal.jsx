import React from 'react';

const CourseDetailModal = ({ course, isOpen, onClose }) => {
  if (!isOpen || !course) return null;

  return (
    <>
      {/* Backdrop - Semi-transparent white overlay */}
      <div
        className='fixed inset-0 bg-opacity-80 backdrop-blur-sm z-40 transition-opacity'
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
        <div className='bg-white rounded-lg shadow-2xl max-w-md w-full border border-gray-200 transform transition-all'>
          {/* Header */}
          <div className='bg-gray-900 text-white px-6 py-4 rounded-t-lg'>
            <h2 className='text-xl font-bold text-white mb-1'>
              {course.course}
            </h2>
            {course.courseCode && (
              <p className='text-sm text-gray-300 font-medium'>
                {course.courseCode}
              </p>
            )}
            <p className='text-sm text-gray-300 font-medium mt-1'>
              {course.type}
            </p>
          </div>

          {/* Content */}
          <div className='px-6 py-4 space-y-4'>
            {/* Course Type Badge */}
            <div className='flex items-center gap-3 pb-3 border-b border-gray-200'>
              <div
                className={`w-3 h-3 rounded-full ${
                  course.type === 'Lecture'
                    ? 'bg-blue-600'
                    : course.type === 'Lab Work'
                    ? 'bg-emerald-600'
                    : course.type === 'Tutorial'
                    ? 'bg-indigo-600'
                    : 'bg-gray-400'
                }`}
              ></div>
              <span className='font-semibold text-gray-900'>{course.type}</span>
            </div>

            {/* Teacher */}
            <div className='space-y-1'>
              <p className='text-sm font-medium text-gray-600'>Teacher</p>
              <p className='text-base font-semibold text-gray-900'>
                {course.teacher}
              </p>
            </div>

            {/* Room */}
            <div className='space-y-1 pb-3 border-b border-gray-200'>
              <p className='text-sm font-medium text-gray-600'>Room</p>
              <p className='text-base font-semibold text-gray-900'>
                {course.room}
              </p>
            </div>

            {/* Time */}
            <div className='space-y-1 pb-3 border-b border-gray-200'>
              <p className='text-sm font-medium text-gray-600'>Time</p>
              <p className='text-base font-semibold text-gray-900'>
                {course.time}
              </p>
            </div>

            {/* Day */}
            <div className='space-y-1'>
              <p className='text-sm font-medium text-gray-600'>Day</p>
              <p className='text-base font-semibold text-gray-900'>
                {course.day}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className='px-6 py-4 bg-gray-50 rounded-b-lg border-t border-gray-200 flex gap-3'>
            <button
              onClick={onClose}
              className='flex-1 px-4 py-2 font-medium text-gray-700 hover:bg-gray-100 transition-colors rounded-md border border-gray-300'
            >
              Close
            </button>
            <button
              onClick={() => {
                // Copy course info to clipboard
                const text = `${course.course}\nTeacher: ${course.teacher}\nRoom: ${course.room}\nTime: ${course.time} - ${course.day}`;
                navigator.clipboard.writeText(text);
                alert('Information copied!');
              }}
              className='flex-1 px-4 py-2 font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors rounded-md'
            >
              Copy
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseDetailModal;
