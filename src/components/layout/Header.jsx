import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();

  // Sur la page d'accueil, on ne montre pas le header
  if (location.pathname === '/') {
    return null;
  }

  const navigation = [
    {
      name: 'Emploi du temp',
      href: '/student',
      current: location.pathname === '/student',
    },
    {
      name: 'Administration',
      href: '/login',
      current: location.pathname === '/login',
    },
  ];

  return (
    <header className='bg-white border-b border-gray-200'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <img src='logo.jpg' alt='Logo' />
        <div className='flex justify-between items-center h-16'>
          {/* Logo à gauche */}
          <div className='flex items-center'>
            <div className='text-xl font-bold text-gray-900'>
              UNIVERSITÉ DE YAOUNDÉ II
            </div>
          </div>

          {/* Navigation à droite - seulement 2 liens */}
          <nav className='flex space-x-8'>
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`inline-flex items-center px-3 py-2 text-sm font-medium border-b-2 ${
                  item.current
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
