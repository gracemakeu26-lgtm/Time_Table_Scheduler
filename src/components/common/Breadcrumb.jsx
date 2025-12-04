import React from 'react';

const Breadcrumb = ({ items = [] }) => {
  return (
    <div className='flex items-center gap-2 text-sm font-semibold py-4 px-6 bg-linear-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100 mb-6'>
      {items.map((item, idx) => (
        <div key={idx} className='flex items-center gap-2'>
          <button
            onClick={item.onClick}
            className={`px-3 py-1 rounded-lg transition-all ${
              item.active
                ? 'bg-linear-to-r from-blue-600 to-purple-600 text-white font-bold'
                : 'text-gray-700 hover:bg-white hover:border hover:border-blue-300'
            }`}
          >
            {item.label}
          </button>
          {idx < items.length - 1 && (
            <span className='text-gray-400 font-bold'>›</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default Breadcrumb;
