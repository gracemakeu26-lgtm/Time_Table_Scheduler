import React, { useState, useEffect, useRef } from 'react';
import { ADMIN_TABS } from '../../constants/adminDashboard';

const NavigationTabs = ({ activeTab, setActiveTab }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const currentTab = ADMIN_TABS.find((tab) => tab.id === activeTab);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  return (
    <div className='sticky top-0 z-40 shadow-lg w-full bg-white border-b border-gray-200'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Mobile Tab Selector */}
        <div className='md:hidden py-3' ref={dropdownRef}>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className='w-full flex items-center justify-between px-4 py-3 text-left border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent'
          >
            <div className='flex items-center'>
              <span className='text-gray-900 font-medium text-base'>
                {currentTab?.label}
              </span>
              <span className='ml-2 text-sm text-gray-500'>
                ({ADMIN_TABS.findIndex((tab) => tab.id === activeTab) + 1}/
                {ADMIN_TABS.length})
              </span>
            </div>
            <svg
              className={`w-5 h-5 transition-transform duration-200 ${
                isMobileMenuOpen ? 'transform rotate-180' : ''
              }`}
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M19 9l-7 7-7-7'
              />
            </svg>
          </button>

          {/* Mobile Dropdown Menu with Animation */}
          {isMobileMenuOpen && (
            <div className='absolute left-4 right-4 mt-2 bg-white border border-gray-300 rounded-lg shadow-xl z-50 animate-in slide-in-from-top-2 duration-200'>
              <div className='py-2'>
                {ADMIN_TABS.map((tab, index) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center justify-between group ${
                      activeTab === tab.id
                        ? 'bg-gray-100 text-gray-900 font-semibold border-l-4 border-gray-900'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {activeTab === tab.id && (
                      <svg
                        className='w-4 h-4 text-gray-900'
                        fill='currentColor'
                        viewBox='0 0 20 20'
                      >
                        <path
                          fillRule='evenodd'
                          d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                          clipRule='evenodd'
                        ></path>
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Desktop Navigation - Enhanced Responsiveness */}
        <nav className='hidden md:flex text-sm font-medium bg-white overflow-x-auto'>
          <div className='flex gap-4 lg:gap-8 xl:gap-12 min-w-max pb-2'>
            {ADMIN_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 transition-all duration-200 whitespace-nowrap relative group ${
                  activeTab === tab.id
                    ? 'border-gray-900 text-gray-900 font-semibold'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <span className='relative z-10'>{tab.label}</span>
                {activeTab === tab.id && (
                  <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 transform scale-x-100 transition-transform'></div>
                )}
                {activeTab !== tab.id && (
                  <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-gray-300 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left'></div>
                )}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default NavigationTabs;
