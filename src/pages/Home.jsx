import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { Button } from '../components/common';
import { APP_INFO, UNIVERSITY_INFO } from '../constants';
import { getFromStorage } from '../utils/storage';

const Home = () => {
  const location = useLocation();
  const isAdminLoggedIn = getFromStorage('auth_token');

  const features = [
    {
      title: 'Consultation Facile',
      description:
        'Accédez rapidement à vos emplois du temps avec une interface intuitive et moderne.',
    },
    {
      title: 'Recherche Avancée',
      description:
        'Trouvez facilement les horaires par département, niveau et semestre.',
    },
    {
      title: 'Accessible Partout',
      description:
        "Consultez vos horaires depuis n'importe quel appareil, à tout moment.",
    },
    {
      title: 'Informations Complètes',
      description:
        'Visualisez les cours, salles, enseignants et horaires en un seul endroit.',
    },
  ];

  return (
    <div className='min-h-screen flex flex-col bg-linear-to-br from-gray-50 via-gray-100 to-gray-200'>
      <Header currentPath={location.pathname} />

      {/* Hero Section */}
      <section className='pt-24 pb-16 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-7xl mx-auto'>
          <div className='text-center mb-16'>
            <div className='inline-flex items-center justify-center w-20 h-20 bg-gray-900 rounded-2xl mb-6 shadow-lg'>
              <span className='text-3xl font-extrabold text-white'>UY</span>
            </div>
            <h1 className='text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-tight'>
              {APP_INFO?.name || 'UniScheduler'}
            </h1>
            <p className='text-xl md:text-2xl text-gray-700 font-semibold mb-4 max-w-3xl mx-auto'>
              {APP_INFO?.tagline || 'Consultation des emplois du temps'}
            </p>
            <p className='text-lg text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed'>
              Le système de gestion des emplois du temps de l'Université de
              Yaoundé I permet aux étudiants, enseignants et parents de
              consulter facilement les horaires de cours, salles et informations
              professionnelles en un seul endroit.
            </p>

            {/* CTA Buttons */}
            <div className='flex flex-col sm:flex-row justify-center items-center gap-4 mb-16'>
              <Link to='/student'>
                <Button
                  variant='primary'
                  className='px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1'
                >
                  Consulter les emplois du temps
                </Button>
              </Link>

              {!isAdminLoggedIn ? (
                <Link to='/login'>
                  <Button
                    variant='secondary'
                    className='px-8 py-4 text-lg font-semibold border-2 border-gray-900 hover:bg-gray-50 transition-all duration-300'
                  >
                    Connexion Admin
                  </Button>
                </Link>
              ) : (
                <Link to='/admin'>
                  <Button
                    variant='primary'
                    className='px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1'
                  >
                    Admin Dashboard
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className='py-16 px-4 sm:px-6 lg:px-8 bg-white'>
        <div className='max-w-7xl mx-auto'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
              Pourquoi choisir UniScheduler ?
            </h2>
            <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
              Une plateforme moderne et efficace pour gérer vos horaires
              académiques
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
            {features.map((feature, index) => (
              <div
                key={index}
                className='bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200'
              >
                <h3 className='text-xl font-bold text-gray-900 mb-3'>
                  {feature.title}
                </h3>
                <p className='text-gray-600 leading-relaxed'>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className='py-16 px-4 sm:px-6 lg:px-8 bg-gray-900'>
        <div className='max-w-7xl mx-auto'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 text-center'>
            <div className='text-white'>
              <div className='text-4xl md:text-5xl font-extrabold mb-2'>
                {UNIVERSITY_INFO.students || '15,000+'}
              </div>
              <div className='text-gray-300 text-lg font-medium'>Étudiants</div>
            </div>
            <div className='text-white'>
              <div className='text-4xl md:text-5xl font-extrabold mb-2'>
                {UNIVERSITY_INFO.faculties || '5'}
              </div>
              <div className='text-gray-300 text-lg font-medium'>Facultés</div>
            </div>
            <div className='text-white'>
              <div className='text-4xl md:text-5xl font-extrabold mb-2'>
                24/7
              </div>
              <div className='text-gray-300 text-lg font-medium'>
                Disponibilité
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* University Info Section */}
      <section className='py-16 px-4 sm:px-6 lg:px-8 bg-white'>
        <div className='max-w-4xl mx-auto text-center'>
          <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-6'>
            {UNIVERSITY_INFO.name}
          </h2>
          <p className='text-lg text-gray-600 leading-relaxed mb-8'>
            Système de gestion des emplois du temps conçu pour simplifier la
            consultation des horaires académiques. Accédez rapidement aux
            informations dont vous avez besoin, quand vous en avez besoin.
          </p>
          <div className='flex flex-col sm:flex-row justify-center items-center gap-6 text-gray-700'>
            <div className='flex items-center gap-2'>
              <span>{UNIVERSITY_INFO.address}</span>
            </div>
            <div className='flex items-center gap-2'>
              <span>{UNIVERSITY_INFO.email}</span>
            </div>
            <div className='flex items-center gap-2'>
              <span>{UNIVERSITY_INFO.phone}</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
