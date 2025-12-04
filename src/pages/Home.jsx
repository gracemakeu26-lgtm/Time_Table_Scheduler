import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { Button } from '../components/common';
import { APP_INFO } from '../constants';

const Home = () => {
  const location = useLocation();

  return (
    <div
      className='min-h-screen flex flex-col items-center'
      style={{
        backgroundImage: "url('/bg-university.png')",
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className='h-screen max-w-5xl w-full mx-auto shadow-xl rounded-lg overflow-hidden flex-1 flex flex-col'>
        <Header currentPath={location.pathname} />

        <main className='py-16 px-6 text-center flex-1 flex flex-col justify-center items-center gap-4'>
          <h1 className='text-4xl font-extrabold text-gray-900 mb-4'>
            {APP_INFO?.name || 'Time Table Scheduler'}
          </h1>
          <h2 className='text-xl text-black font-semibold mb-10'>
            {APP_INFO?.tagline || 'Consultez facilement les emplois du temps'}
          </h2>

          <div className='flex flex-col md:flex-row justify-center items-center gap-6 px-3 py-2 '>
            <Link to='/student'>
              <Button variant='primary' className='px-4 py-3'>
                Consulter les emplois du temps
              </Button>
            </Link>

            <Link to='/login'>
              <Button variant='secondary' className='px-4 py-3'>
                Connexion Admin
              </Button>
            </Link>
          </div>
        </main>

        <section className='py-10 px-6 flex justify-center items-center'>
          <div className='max-w-3xl mx-auto text-center bg-gray-800 rounded-lg bg-opacity-20 shadow-md'>
            <p className='text-white text-lg my-auto leading-relaxed'>
              The University of Yaoundé I timetable system allows <br />
              students, teachers and parents to easily view class schedules,{' '}
              <br />
              classrooms and professional information in one place.
            </p>
          </div>
        </section>
      </div>

      {/* Footer wrapped in same centered container so it aligns with page content */}
      <Footer />
    </div>
  );
};

export default Home;
