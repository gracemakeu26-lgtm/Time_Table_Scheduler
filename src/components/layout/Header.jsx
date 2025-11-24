import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAV_LINKS, UNIVERSITY_INFO } from '../../constants';

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
    <header className='gradient-primary shadow-lg'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo à gauche */}
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 bg-white rounded-lg flex items-center justify-center'>
              <span className='text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>🎓</span>
            </div>
            <div className='text-lg font-extrabold text-white drop-shadow'>
              UNIVERSITÉ DE YAOUNDÉ II
            </div>
          </div>

          {/* Navigation */}
          <nav
            aria-label='Navigation principale'
            className='flex text-white font-semibold ml-auto space-x-8'
          >
            {visibleLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`transition-all duration-300 pb-1 border-b-2 ${
                  location.pathname === link.to
                    ? 'border-white text-white'
                    : 'border-transparent text-blue-100 hover:text-white'
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
