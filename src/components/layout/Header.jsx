import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAV_LINKS, UNIVERSITY_INFO } from '../../constants';
import { getFromStorage } from '../../utils/storage';

const Header = () => {
  const location = useLocation();
  const isAdminLoggedIn = getFromStorage('auth_token');

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
    <header className='fixed top-0 z-50 bg-gray-200 w-full flex justify-around py-4 px-6 md:px-12 rounded-t-lg mb-auto'>
      <div className='max-w-5xl w-full px-auto flex justify-between items-center mx-auto h-14'>
        {/* Logo and UNIVERSITY NAME */}
        <div className='flex items-center space-x-4 grow gap-3'>
          <div
            className='w-12 h-12 rounded-full border border-gray-300 flex shrink-0 bg-cover bg-center'
            style={{ backgroundImage: "url('/logo.jpg')" }}
            aria-hidden='true'
          />
          <div className='flex flex-col'>
            <span className='text-gray-700 font-semibold text-sm'>
              {UNIVERSITY_INFO.name}
            </span>
            {/* optional fallback text or <img> for accessibility */}
          </div>
        </div>

        {/* Navigation */}
        <nav
          aria-label='Navigation principale'
          className='flex text-gray-700 font-medium ml-auto space-x-10 gap-8 items-center'
        >
          {visibleLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`hover:text-gray-900 transition-colors ${
                location.pathname === link.to
                  ? 'text-gray-900 font-semibold'
                  : ''
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Admin Navigation - Show when logged in */}
          {isAdminLoggedIn && (
            <>
              {!location.pathname.startsWith('/admin') && (
                <Link
                  to='/admin'
                  className='bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors text-sm font-medium'
                >
                  Admin Dashboard
                </Link>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
