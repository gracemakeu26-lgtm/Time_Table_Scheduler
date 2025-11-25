import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAV_LINKS } from '../../constants';

const Header = () => {
  const location = useLocation();

  // Don't show header on home page
  if (location.pathname === '/') {
    return null;
  }

  // Filter navigation links based on current path
  const visibleLinks = NAV_LINKS.filter((link) => {
    if (link.hideOn && link.hideOn.includes(location.pathname)) {
      return false;
    }
    return true;
  });

  return (
    <header className='bg-white shadow-sm border-b border-gray-200'>
      <div className='w-full px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo */}
          <div className='flex items-center gap-2'>
            <div className='text-2xl font-bold text-blue-600'>
              UY1
            </div>
            <div className='text-sm font-semibold text-gray-900'>
              Timetable
            </div>
          </div>

          {/* Navigation */}
          <nav className='flex text-gray-700 font-medium ml-auto gap-20 pr-4'>
            {visibleLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`transition-colors duration-200 text-sm whitespace-nowrap ${
                  location.pathname === link.to
                    ? 'text-blue-600 font-semibold'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
