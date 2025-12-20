import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAV_LINKS, UNIVERSITY_INFO } from '../../constants';
import { getFromStorage } from '../../utils/storage';

const Header = () => {
  const location = useLocation();
  const isAdminLoggedIn = getFromStorage('auth_token');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Don't render the header on the login page
  if (location.pathname === '/') {
    return null;
  }

  // Filter navigation links based on user role
  const visibleLinks = NAV_LINKS.filter((link) => {
    // Hide Admin Login if admin is already logged in
    if (link.to === '/login' && isAdminLoggedIn) {
      return false;
    }
    // Hide links based on current pathname
    if (link.hideOn && link.hideOn.includes(location.pathname)) {
      return false;
    }
    return true;
  });

  return (
    <header className='fixed top-0 z-50 bg-gray-200 w-full py-4 px-4 sm:px-6 lg:px-12 rounded-t-lg mb-auto'>
      <div className='max-w-5xl w-full flex justify-between items-center mx-auto h-14'>
        {/* Logo and UNIVERSITY NAME, now clickable to the home page */}
        <Link
          to='/'
          className='flex items-center space-x-1 grow gap-1 group focus:outline-none'
        >
          <img
            src='/logo.png'
            alt='UniScheduler Logo'
            className='w-10 transition-transform group-hover:scale-105'
          />
          <div className='flex flex-col'>
            <span className='text-gray-700 font-semibold text-xs sm:text-sm truncate max-w-32 sm:max-w-none group-hover:text-gray-900'>
              {UNIVERSITY_INFO.name}
            </span>
          </div>
        </Link>

        {/* Mobile menu button */}
        <button
          className='md:hidden text-gray-700 hover:text-gray-900 p-2 transition-all duration-200 ease-in-out transform hover:scale-110 active:scale-95 rounded-md hover:bg-gray-300'
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label='Toggle mobile menu'
        >
          <svg
            className='w-6 h-6 transition-transform duration-200'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            {isMobileMenuOpen ? (
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            ) : (
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M4 6h16M4 12h16M4 18h16'
              />
            )}
          </svg>
        </button>

        {/* Desktop Navigation */}
        <nav
          aria-label='Navigation principale'
          className='hidden md:flex text-gray-700 font-medium ml-auto space-x-6 lg:space-x-10 items-center'
        >
          {visibleLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`relative hover:text-gray-900 transition-all duration-200 ease-in-out text-sm lg:text-base transform hover:scale-105 ${
                location.pathname === link.to
                  ? 'text-gray-900 font-semibold'
                  : ''
              }`}
            >
              <span className='relative z-10'>{link.label}</span>
              {location.pathname === link.to && (
                <span className='absolute bottom-0 left-0 w-full h-0.5 bg-gray-900 transform transition-all duration-200'></span>
              )}
              {location.pathname !== link.to && (
                <span className='absolute bottom-0 left-0 w-0 h-0.5 bg-gray-900 transform transition-all duration-200 hover:w-full'></span>
              )}
            </Link>
          ))}

          {/* Admin Navigation - Show when logged in */}
          {isAdminLoggedIn && (
            <>
              {!location.pathname.startsWith('/admin') && (
                <Link
                  to='/admin'
                  className='bg-gray-900 text-white px-3 lg:px-4 py-2 rounded-md hover:bg-gray-800 transition-all duration-200 ease-in-out text-xs lg:text-sm font-medium transform hover:scale-105 active:scale-95 hover:shadow-lg'
                >
                  Admin Dashboard
                </Link>
              )}
            </>
          )}
        </nav>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className='md:hidden bg-gray-200 border-t border-gray-300'>
          <nav className='px-4 py-4 space-y-3'>
            {visibleLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`block text-gray-700 hover:text-gray-900 transition-all duration-200 ease-in-out py-2 transform hover:translate-x-1 hover:scale-105 rounded-md px-2 ${
                  location.pathname === link.to
                    ? 'text-gray-900 font-semibold bg-gray-300'
                    : 'hover:bg-gray-300'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {/* Admin Navigation - Mobile */}
            {isAdminLoggedIn && (
              <>
                {!location.pathname.startsWith('/admin') && (
                  <Link
                    to='/admin'
                    className='block bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-all duration-200 ease-in-out text-sm font-medium mt-4 transform hover:scale-105 active:scale-95 hover:shadow-lg'
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
