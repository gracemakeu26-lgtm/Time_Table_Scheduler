import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/layout/Footer';

const Home = () => {
  return (
    <div className='min-h-screen bg-white flex flex-col'>
      {/* Header */}
      <header className='bg-white border-b border-gray-200 shadow-sm'>
        <div className='w-full px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div className='flex items-center gap-2'>
              <div className='text-2xl font-bold text-blue-600'>UY1</div>
              <div className='text-sm font-semibold text-gray-900'>Timetable</div>
            </div>
            <nav className='flex ml-auto gap-20 pr-4'>
              <a href='#home' className='text-sm font-medium text-blue-600 font-semibold hover:text-blue-700 transition'>Home</a>
              <Link to='/student' className='text-sm font-medium text-gray-600 hover:text-blue-600 transition'>Timetable</Link>
              <Link to='/login' className='text-sm font-medium text-gray-600 hover:text-blue-600 transition'>Admin Login</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className='relative h-screen bg-cover bg-center flex items-center justify-center text-white' style={{ backgroundImage: 'url(/public/assets/bg-university.png)', backgroundAttachment: 'fixed' }}>
        <div className='absolute inset-0 bg-black/40'></div>
        <div className='relative z-10 text-center px-4 max-w-2xl'>
          <h1 className='text-6xl font-bold mb-6 leading-tight'>Timetable System</h1>
          <p className='text-xl text-white/95 mb-12 font-normal leading-relaxed'>View your classes anytime, anywhere. Simple, fast and always up to date.</p>
          <div className='flex gap-6 justify-center'>
            <Link to='/student' className='bg-blue-600 text-white px-8 py-4 rounded-md font-semibold hover:bg-blue-700 transition flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105'>
              View Timetables
              <span>→</span>
            </Link>
            <Link to='/login' className='bg-white text-gray-900 px-8 py-4 rounded-md font-semibold hover:bg-gray-50 transition border-2 border-white shadow-lg hover:shadow-xl transform hover:scale-105'>
              Admin Access
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className='flex-grow'>
        {/* Description */}
        <section className='py-20 px-4 bg-white'>
          <div className='max-w-3xl mx-auto text-center'>
            <p className='text-gray-600 text-lg leading-relaxed'>
              The University of Yaoundé I timetable system allows students, teachers and parents to easily view class schedules, classrooms and professional information in one place.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
