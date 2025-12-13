import React from 'react';
import { ADMIN_TABS } from '../../constants/adminDashboard';

const NavigationTabs = ({ activeTab, setActiveTab }) => {
  return (
    <div className='sticky top-0 z-40 shadow-lg w-full bg-white border-b border-gray-200'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-2'>
        <nav className='flex gap-12 text-sm font-medium bg-white'>
          {ADMIN_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-gray-900 text-gray-900 font-semibold'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:-translate-y-1'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default NavigationTabs;
