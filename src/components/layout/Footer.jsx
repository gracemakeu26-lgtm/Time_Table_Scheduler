import React from 'react';
import { UNIVERSITY_INFO, APP_INFO } from '../../constants';

const Footer = () => {
  return (
    <footer className='bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 text-white py-8 border-t-4 border-purple-600'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 text-center md:text-left'>
          <div>
            <p className='font-bold text-lg mb-1 text-purple-300'>📍 {UNIVERSITY_INFO.name}</p>
            <p className='text-gray-400 text-sm'>Système de Gestion Moderne</p>
          </div>
          <div>
            <p className='font-bold text-lg mb-1 text-purple-300'>📧 Contact</p>
            <p className='text-gray-400 text-sm'>{UNIVERSITY_INFO.contact}</p>
          </div>
          <div>
            <p className='font-bold text-lg mb-1 text-purple-300'>📍 Adresse</p>
            <p className='text-gray-400 text-sm'>{UNIVERSITY_INFO.address}</p>
          </div>
        </div>
        <div className='border-t border-gray-700 pt-4'>
          <p className='text-gray-500 text-xs text-center'>
            &copy; {APP_INFO.year} Tous droits réservés | Système de Gestion des Emplois du Temps
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
