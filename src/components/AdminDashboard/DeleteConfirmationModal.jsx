import React from 'react';

const DeleteConfirmationModal = ({
  isOpen,
  name,
  type,
  isSubmitting,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        className='fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm z-50'
        onClick={onClose}
      ></div>
      <div className='fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none'>
        <div
          className='bg-white rounded-lg shadow-2xl max-w-md w-full border border-gray-200 transform transition-all pointer-events-auto'
          onClick={(e) => e.stopPropagation()}
        >
          <div className='bg-red-600 text-white px-6 py-4 rounded-t-lg'>
            <h2 className='text-xl font-bold'>Confirm Delete</h2>
          </div>
          <div className='p-6'>
            <p className='text-gray-700 mb-4'>
              Are you sure you want to delete{' '}
              <span className='font-semibold text-gray-900'>"{name}"</span>?
              This action cannot be undone.
            </p>
            {type === 'timetable' && (
              <p className='text-sm text-red-600 mb-4'>
                ⚠️ Warning: All slots associated with this timetable will also
                be deleted.
              </p>
            )}
            {type === 'slot' && (
              <p className='text-sm text-gray-600 mb-4'>
                This slot will be permanently removed from the timetable.
              </p>
            )}
            <div className='flex justify-end gap-3'>
              <button
                onClick={onClose}
                className='px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition text-sm font-medium'
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isSubmitting}
                className='px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
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
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DeleteConfirmationModal;
