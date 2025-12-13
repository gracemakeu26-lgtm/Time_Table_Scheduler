import React from 'react';

const OverviewTab = ({ timetables, stats }) => {
  return (
    <div>
      <h2 className='text-xl font-bold text-gray-900 mb-6'>
        Dashboard Overview
      </h2>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8'>
        <div className='bg-white rounded-md border border-gray-200 p-6'>
          <div className='text-sm text-gray-600 font-medium mb-2'>
            Total Departments
          </div>
          <div className='text-3xl font-bold text-blue-600'>
            {stats.departments}
          </div>
          <div className='text-xs text-gray-500 mt-2'>Active departments</div>
        </div>
        <div className='bg-white rounded-md border border-gray-200 p-6'>
          <div className='text-sm text-gray-600 font-medium mb-2'>
            Total Timetables
          </div>
          <div className='text-3xl font-bold text-blue-600'>
            {stats.timetables}
          </div>
          <div className='text-xs text-gray-500 mt-2'>All timetables</div>
        </div>
        <div className='bg-white rounded-md border border-gray-200 p-6'>
          <div className='text-sm text-gray-600 font-medium mb-2'>
            Published
          </div>
          <div className='text-3xl font-bold text-green-600'>
            {stats.publishedTimetables}
          </div>
          <div className='text-xs text-gray-500 mt-2'>Published timetables</div>
        </div>
        <div className='bg-white rounded-md border border-gray-200 p-6'>
          <div className='text-sm text-gray-600 font-medium mb-2'>Drafts</div>
          <div className='text-3xl font-bold text-yellow-600'>
            {stats.draftTimetables}
          </div>
          <div className='text-xs text-gray-500 mt-2'>Draft timetables</div>
        </div>
      </div>

      {/* Recent Timetables */}
      <div className='bg-white/10 backdrop-blur-3xl rounded-md p-6'>
        <h3 className='text-lg font-bold text-gray-900 mb-4'>
          Recent Timetables
        </h3>
        {timetables.length === 0 ? (
          <p className='text-gray-400'>No timetables yet</p>
        ) : (
          <div className='divide-y'>
            {timetables.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className='py-4 flex justify-between items-center'
              >
                <div>
                  <div className='font-medium text-gray-900'>{item.name}</div>
                  <div className='text-xs text-gray-200'>
                    {item.academic_year || 'N/A'} - {item.semester || 'N/A'}
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    item.status === 'published'
                      ? 'bg-green-100 text-green-700'
                      : item.status === 'draft'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OverviewTab;
