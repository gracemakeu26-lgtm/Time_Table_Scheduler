import React from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '../components/common';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { APP_INFO } from '../constants';

const Home = () => {
  const { pathname } = useLocation();

  return (
    <div className='min-h-screen relative flex flex-col items-center justify-center p-4 sm:p-8'>
      <div className='max-w-5xl w-full mx-auto glass-effect rounded-3xl overflow-hidden shadow-2xl'>
        <Header currentPath={pathname} />
        
        {/* Hero Section with Premium Background */}
        <div className='gradient-primary py-24 px-6 sm:px-12 text-center relative overflow-hidden'>
          {/* Animated background elements */}
          <div className='absolute inset-0 opacity-10'>
            <div className='absolute w-96 h-96 bg-white rounded-full blur-3xl top-0 left-0'></div>
            <div className='absolute w-96 h-96 bg-blue-300 rounded-full blur-3xl bottom-0 right-0'></div>
          </div>
          
          <div className='relative z-10'>
            <h1 className='text-6xl sm:text-7xl font-extrabold text-white mb-4 drop-shadow-lg'>
              {APP_INFO.name}
            </h1>
            <h2 className='text-2xl sm:text-3xl text-blue-100 mb-12 font-semibold'>{APP_INFO.tagline}</h2>
            <div className='flex flex-col md:flex-row justify-center items-center gap-6'>
              <Button to='/student' size='lg'>
                Consulter les emplois du temps
              </Button>
              <Button to='/login' size='lg' variant='secondary'>
                Connexion Admin
              </Button>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <main className='py-20 px-6 sm:px-12 text-center grow bg-gradient-to-b from-blue-50 to-white'>
          {/* Description Box */}
          <div className='bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50 rounded-2xl p-10 mb-12 border border-blue-200 shadow-lg'>
            <p className='text-xl text-gray-800 max-w-3xl mx-auto leading-relaxed font-medium'>
              {APP_INFO.description}
            </p>
          </div>
          
          {/* Feature Cards */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-5xl mx-auto'>
            {/* Card 1 - Students */}
            <div className='group glass-effect text-gray-900 rounded-2xl p-8 shadow-xl card-hover border border-blue-100 hover:border-blue-300 relative overflow-hidden'>
              <div className='absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 opacity-0 group-hover:opacity-5 transition-all duration-300'></div>
              <div className='relative z-10'>
                <div className='w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 mx-auto'>
                  <span className='text-2xl font-bold text-white'>1</span>
                </div>
                <h3 className='text-2xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent'>Pour les Étudiants</h3>
                <p className='text-gray-700 font-medium'>Consultez votre emploi du temps facilement sans inscription</p>
              </div>
            </div>
            
            {/* Card 2 - Administration */}
            <div className='group glass-effect text-gray-900 rounded-2xl p-8 shadow-xl card-hover border border-purple-100 hover:border-purple-300 relative overflow-hidden'>
              <div className='absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 opacity-0 group-hover:opacity-5 transition-all duration-300'></div>
              <div className='relative z-10'>
                <div className='w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 mx-auto'>
                  <span className='text-2xl font-bold text-white'>2</span>
                </div>
                <h3 className='text-2xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent'>Pour l&apos;Administration</h3>
                <p className='text-gray-700 font-medium'>Gérez les emplois du temps facilement avec une interface intuitive</p>
              </div>
            </div>
            
            {/* Card 3 - Features */}
            <div className='group glass-effect text-gray-900 rounded-2xl p-8 shadow-xl card-hover border border-pink-100 hover:border-pink-300 relative overflow-hidden'>
              <div className='absolute inset-0 bg-gradient-to-br from-pink-500 to-pink-600 opacity-0 group-hover:opacity-5 transition-all duration-300'></div>
              <div className='relative z-10'>
                <div className='w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-6 mx-auto'>
                  <span className='text-2xl font-bold text-white'>3</span>
                </div>
                <h3 className='text-2xl font-bold mb-3 bg-gradient-to-r from-pink-600 to-pink-700 bg-clip-text text-transparent'>Efficace & Rapide</h3>
                <p className='text-gray-700 font-medium'>Interface moderne et réactive sur tous les appareils</p>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

export default Home;
