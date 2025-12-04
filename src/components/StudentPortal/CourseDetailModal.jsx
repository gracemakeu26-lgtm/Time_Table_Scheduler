import React from 'react';

const CourseDetailModal = ({ course, isOpen, onClose }) => {
  if (!isOpen || !course) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className='fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity'
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
        <div className='bg-white rounded-3xl shadow-2xl max-w-md w-full glass-effect border border-blue-200 transform transition-all'>
          {/* Header */}
          <div className='gradient-primary text-white px-8 py-6 rounded-t-3xl'>
            <h2 className='text-2xl font-bold mb-2'>{course.course}</h2>
            <p className='text-blue-100 text-sm font-semibold'>{course.type}</p>
          </div>

          {/* Content */}
          <div className='px-8 py-6 space-y-4'>
            {/* Course Type Badge */}
            <div className='flex items-center gap-3 pb-4 border-b border-gray-200'>
              <div className='w-3 h-3 rounded-full bg-linear-to-r from-blue-500 to-purple-500'></div>
              <span className='font-semibold text-gray-700'>{course.type}</span>
            </div>

            {/* Teacher */}
            <div className='space-y-1'>
              <p className='text-sm font-semibold text-gray-600 uppercase tracking-wide'>
                Enseignant
              </p>
              <p className='text-lg font-bold text-gray-900'>
                {course.teacher}
              </p>
            </div>

            {/* Room */}
            <div className='space-y-1 pb-4 border-b border-gray-100'>
              <p className='text-sm font-semibold text-gray-600 uppercase tracking-wide'>
                Salle
              </p>
              <p className='text-lg font-bold text-blue-600'>{course.room}</p>
            </div>

            {/* Time */}
            <div className='space-y-1 pb-4 border-b border-gray-100'>
              <p className='text-sm font-semibold text-gray-600 uppercase tracking-wide'>
                Horaire
              </p>
              <p className='text-lg font-bold text-gray-900'>{course.time}</p>
            </div>

            {/* Day */}
            <div className='space-y-1'>
              <p className='text-sm font-semibold text-gray-600 uppercase tracking-wide'>
                Jour
              </p>
              <p className='text-lg font-bold text-gray-900'>{course.day}</p>
            </div>
          </div>

          {/* Footer */}
          <div className='px-8 py-4 bg-linear-to-r from-blue-50 to-purple-50 rounded-b-3xl border-t border-gray-200 flex gap-3'>
            <button
              onClick={onClose}
              className='flex-1 px-4 py-2 font-semibold text-gray-700 hover:bg-white transition-colors rounded-lg border border-gray-300'
            >
              Fermer
            </button>
            <button
              onClick={() => {
                // Copy course info to clipboard
                const text = `${course.course}\nEnseignant: ${course.teacher}\nSalle: ${course.room}\nHoraire: ${course.time} - ${course.day}`;
                navigator.clipboard.writeText(text);
                alert('Informations copiées!');
              }}
              className='flex-1 px-4 py-2 font-semibold text-white bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all rounded-lg'
            >
              Copier
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseDetailModal;
