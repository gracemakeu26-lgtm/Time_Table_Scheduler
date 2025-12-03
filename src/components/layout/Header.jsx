import React from "react";
import { Link, useLocation} from 'react-router-dom';
import {NAV_LINKS, UNIVERSITY_INFO} from '../../constants';

const Header = () => {
  const location = useLocation();

  // Don't render the header on the login page
  if(location.pathname === '/') {
    return null;
  }

  // Filter navigation links based on user role
  const visibleLinks = NAV_LINKS.filter(link => {
    if(link.hideOn && link.hideOn.includes(location.pathname)) {
      return false;
    }
    return true;
  });

  return (
    <header className="bg-gray-200 py-4 px-6 md:px-12 rounded-t-lg ">
      <div className="max-w-7xl mx-auto flex justify-between items-center h-24">
        {/* Logo and UNIVERSITY NAME */}
        <div className="flex items-center space-x-4 grow gap-3">
          <div
            className="w-12 h-12 rounded-full border border-gray-300 flex shrink-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/logo.jpg')" }}
            aria-hidden="true"
          />
          <div className="flex flex-col">
            <span className="text-gray-700 font-semibold text-sm">
            {UNIVERSITY_INFO.name}
            </span>
            {/* optional fallback text or <img> for accessibility */}
          </div>
        </div> 
        

        {/* Navigation */}
        <nav 
          aria-label='Navigation principale'
          className="flex text-gray-700 font-medium ml-auto space-x-10 gap-8"
          >
            {visibleLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`hover:text-blue-600 transition-colors ${
                  location.pathname===link.to
                  ?'text-blue-600 font-semibold'
                  : ''
                }`}
                >
                  {link.label}
                </Link>
            ))}
        </nav>
        </div>
      </header>
  );
};

export default Header