import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Loading = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => navigate('/'), 500);
          return 100;
        }
        return prev + Math.random() * 30;
      });
    }, 200);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className='min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col items-center justify-center p-4'>
      <div className='text-center'>
        <div className='mb-8'>
          <div className='w-20 h-20 mx-auto bg-linear-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg'>
            <span className='text-4xl font-extrabold text-white'>UY</span>
          </div>
          <h1 className='text-4xl font-extrabold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2'>
            Unischeduler
          </h1>
          <p className='text-lg text-gray-600'>
            Système de Gestion des Emplois du Temps
          </p>
        </div>

        <div className='mt-12 w-full max-w-md'>
          <div className='mb-4'>
            <div className='flex justify-between items-center mb-2'>
              <span className='text-sm font-semibold text-gray-700'>
                Chargement en cours...
              </span>
              <span className='text-sm font-semibold text-purple-600'>
                {Math.round(progress)}%
              </span>
            </div>
            <div className='w-full h-2 bg-gray-200 rounded-full overflow-hidden'>
              <div
                className='h-full bg-linear-to-r from-blue-600 to-purple-600 transition-all duration-300 ease-out'
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          <p className='text-sm text-gray-500'>Veuillez patienter...</p>
        </div>
      </div>

      <div className='absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2'>
        <div
          className='w-2 h-2 bg-blue-600 rounded-full animate-bounce'
          style={{ animationDelay: '0s' }}
        ></div>
        <div
          className='w-2 h-2 bg-purple-600 rounded-full animate-bounce'
          style={{ animationDelay: '0.2s' }}
        ></div>
        <div
          className='w-2 h-2 bg-pink-600 rounded-full animate-bounce'
          style={{ animationDelay: '0.4s' }}
        ></div>
      </div>
    </div>
  );
};

export default Loading;
