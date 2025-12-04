import React from 'react';
import { UNIVERSITY_INFO, APP_INFO } from '../../constants';

const Footer = () => {
  return (
    <footer className='bg-gray-900 text-white border-t border-gray-700 w-full mt-8'>
      <div className='px-4 sm:px-6 lg:px-8 text-center'>
        <p className='font-semibold text-xl mb-3'>{UNIVERSITY_INFO.name}</p>
        <p className='text-gray-400 text-sm mb-3'>
          Système de Gestion des Emplois du Temps
        </p>
        <div className='border-t border-gray-700 pt-3'>
          <p className='text-gray-500 text-sm'>
            &copy; {APP_INFO.year} Tous droits réservés |{' '}
            {UNIVERSITY_INFO.address} | Contact: {UNIVERSITY_INFO.contact}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
