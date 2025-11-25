import React from 'react';
import { UNIVERSITY_INFO, APP_INFO } from '../../constants';

const Footer = () => {
  return (
    <footer className='bg-white border-t border-gray-200 py-16 mt-auto'>
      <div className='w-full px-4 sm:px-6 lg:px-8'>
        <div className='max-w-7xl mx-auto'>
          {/* Main Content Grid */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-16 mb-12'>
            {/* About Section */}
            <div>
              <h4 className='font-semibold text-gray-900 mb-4 text-sm'>About</h4>
              <p className='text-sm text-gray-600 leading-relaxed'>The University of Yaoundé I provides students, parents and teachers easy access to class schedules, classrooms and professional information in one place.</p>
            </div>

            {/* Quick Links Section */}
            <div>
              <h4 className='font-semibold text-gray-900 mb-4 text-sm'>Quick Links</h4>
              <ul className='space-y-3 text-sm'>
                <li>
                  <a href='/' className='text-gray-600 hover:text-blue-600 transition duration-200'>Home</a>
                </li>
                <li>
                  <a href='/student' className='text-gray-600 hover:text-blue-600 transition duration-200'>Timetable</a>
                </li>
                <li>
                  <a href='/login' className='text-gray-600 hover:text-blue-600 transition duration-200'>Admin Access</a>
                </li>
              </ul>
            </div>

            {/* Contact Section */}
            <div>
              <h4 className='font-semibold text-gray-900 mb-4 text-sm'>Contact Information</h4>
              <ul className='space-y-3 text-sm'>
                <li className='flex items-center gap-3'>
                  <span className='text-blue-600'>✉️</span>
                  <a href={`mailto:${UNIVERSITY_INFO.email}`} className='text-gray-600 hover:text-blue-600 transition duration-200'>{UNIVERSITY_INFO.email}</a>
                </li>
                <li className='flex items-center gap-3'>
                  <span className='text-blue-600'>📞</span>
                  <a href={`tel:${UNIVERSITY_INFO.phone}`} className='text-gray-600 hover:text-blue-600 transition duration-200'>{UNIVERSITY_INFO.phone}</a>
                </li>
                <li className='flex items-start gap-3'>
                  <span className='text-blue-600 mt-0.5'>📍</span>
                  <span className='text-gray-600'>{UNIVERSITY_INFO.address}</span>
                </li>
              </ul>
              {/* Social Links - LinkedIn Only */}
              <div className='flex gap-4 mt-6'>
                <a href='https://cm.linkedin.com/company/uy1' target='_blank' rel='noopener noreferrer' className='text-gray-400 hover:text-blue-600 transition text-lg' title='LinkedIn'>in</a>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className='border-t border-gray-200 pt-8'>
            <p className='text-xs text-gray-500 text-center'>
              &copy; {APP_INFO.year} {UNIVERSITY_INFO.name} - Timetable Management System. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
