import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input, Button } from '../components/common';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { BackIcon } from '../components/icons';
import { useForm } from '../hooks';
import { validateForm } from '../utils/helpers';
import { authAPI } from '../utils/api';
import { getFromStorage } from '../utils/storage';

const Login = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Redirect to admin dashboard if already logged in
  useEffect(() => {
    const token = getFromStorage('auth_token');
    if (token) {
      navigate('/admin');
    }
  }, [navigate]);

  const { values, errors, handleChange, handleBlur, setErrors } = useForm({
    identifiant: '',
    motdepasse: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    const validationErrors = validateForm(values, {
      identifiant: { required: true, message: "L'identifiant est requis" },
      motdepasse: {
        required: true,
        minLength: 4,
        message: 'Le mot de passe doit contenir au moins 4 caractères',
      },
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await authAPI.login(values.identifiant, values.motdepasse);
      navigate('/admin');
    } catch (error) {
      setLoginError(
        error.response?.data?.error ||
          'Erreur de connexion. Vérifiez vos identifiants.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='min-h-screen pt-24 flex flex-col bg-linear-to-br from-gray-50 via-gray-100 to-gray-200'>
      <Header />

      {/* Main Content */}
      <main className='flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 '>
        <div className='w-full max-w-md'>
          {/* Login Card */}
          <div className='bg-white rounded-2xl shadow-xl border border-gray-200 p-8 md:p-10'>
            {/* Header */}
            <div className='text-center mb-8'>
              <h1 className='text-3xl md:text-4xl font-extrabold text-gray-900 mb-2'>
                Accès Administration
              </h1>
              <p className='text-gray-600 text-base'>
                Connectez-vous pour gérer les emplois du temps
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className='space-y-6'>
              <div>
                <Input
                  label='Identifiant'
                  placeholder='Entrez votre identifiant'
                  type='text'
                  name='identifiant'
                  value={values.identifiant}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.identifiant}
                  required
                />
              </div>

              <div>
                <Input
                  label='Mot de passe'
                  placeholder='Entrez votre mot de passe'
                  type='password'
                  name='motdepasse'
                  value={values.motdepasse}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.motdepasse}
                  required
                />
              </div>

              {loginError && (
                <div className='p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm'>
                  <div className='flex items-start'>
                    <span className='text-red-500 mr-2'>⚠️</span>
                    <span>{loginError}</span>
                  </div>
                </div>
              )}

              <Button
                type='submit'
                variant='primary'
                disabled={isSubmitting}
                className='w-full py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300'
              >
                {isSubmitting ? (
                  <span className='flex items-center justify-center'>
                    <svg
                      className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                    >
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                      ></circle>
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      ></path>
                    </svg>
                    Connexion en cours...
                  </span>
                ) : (
                  'Se connecter'
                )}
              </Button>
            </form>

            {/* Back to Home Link */}
            <div className='mt-6 text-center'>
              <Link
                to='/'
                className='inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium'
              >
                <BackIcon className='h-4 w-4 mr-2' />
                Retour à l'accueil
              </Link>
            </div>
          </div>

          {/* Additional Info */}
          <div className='mt-6 text-center'>
            <p className='text-sm text-gray-500'>
              Accès réservé aux administrateurs autorisés
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;
