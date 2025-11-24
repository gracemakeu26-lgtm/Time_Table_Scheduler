import React from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '../components/common';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { APP_INFO } from '../constants';

const Home = () => {
  const { pathname } = useLocation();

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 sm:p-8 flex flex-col items-center'>
      <div className='max-w-5xl w-full mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden'>
        <Header currentPath={pathname} />
        <div className='gradient-primary py-20 px-6 text-center'>
          <h1 className='text-5xl font-extrabold text-white mb-4 drop-shadow-lg'>
            {APP_INFO.name}
          </h1>
          <h2 className='text-2xl text-blue-100 mb-10 font-semibold'>{APP_INFO.tagline}</h2>
          <div className='flex flex-col md:flex-row justify-center items-center gap-6'>
            <Button to='/student' size='lg'>
              📅 Consulter les emplois du temps
            </Button>
            <Button to='/login' size='lg' variant='secondary'>
              🔐 Connexion Admin
            </Button>
          </div>
        </div>
        <main className='py-16 px-6 text-center grow'>
          <div className='bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-8 mb-8 border-2 border-yellow-200'>
            <p className='text-lg text-gray-800 max-w-2xl mx-auto'>
              {APP_INFO.description}
            </p>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto'>
            <div className='bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg card-hover'>
              <div className='text-3xl mb-2'>👥</div>
              <h3 className='text-lg font-bold mb-2'>Pour les Étudiants</h3>
              <p className='text-sm text-blue-100'>Consultez votre emploi du temps facilement</p>
            </div>
            <div className='bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg card-hover'>
              <div className='text-3xl mb-2'>⚙️</div>
              <h3 className='text-lg font-bold mb-2'>Pour l&apos;Administration</h3>
              <p className='text-sm text-purple-100'>Gérez les emplois du temps facilement</p>
            </div>
            <div className='bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-xl p-6 shadow-lg card-hover'>
              <div className='text-3xl mb-2'>📊</div>
              <h3 className='text-lg font-bold mb-2'>Efficace & Rapide</h3>
              <p className='text-sm text-pink-100'>Interface moderne et intuitive</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Home;
