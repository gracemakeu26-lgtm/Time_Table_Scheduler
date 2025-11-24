import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input } from '../components/common';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { BackIcon } from '../components/icons';
import { useForm } from '../hooks';
import { validateForm } from '../utils/helpers';

const Login = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { values, errors, handleChange, handleBlur, setErrors } = useForm({
    identifiant: '',
    motdepasse: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation rules
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

    // TODO: Implement actual authentication logic
    setTimeout(() => {
      setIsSubmitting(false);
      // Navigate to admin dashboard after successful login
      console.log('Login attempt:', values);
    }, 1000);
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 sm:p-8 flex flex-col items-center'>
      <div className='max-w-5xl w-full mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden'>
        <Header />

        <main className='py-12 px-6 flex justify-center grow bg-gradient-to-b from-gray-50 to-white'>
          <div className='p-8 rounded-2xl shadow-lg max-w-sm w-full bg-white border-2 border-purple-100'>
            <div className='gradient-primary text-white rounded-lg p-4 mb-6 text-center'>
              <h2 className='text-2xl font-bold'>🔐 Accès Administration</h2>
              <p className='text-purple-100 text-sm mt-1'>Authentification Sécurisée</p>
            </div>

            <form onSubmit={handleSubmit}>
              <Input
                label='Identifiant'
                type='text'
                name='identifiant'
                value={values.identifiant}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.identifiant}
                required
                className='mb-4'
              />

              <Input
                label='Mot de passe'
                type='password'
                name='motdepasse'
                value={values.motdepasse}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.motdepasse}
                required
                className='mb-8'
              />

              <div className='flex flex-col items-center space-y-4'>
                <Button
                  type='submit'
                  variant='primary'
                  disabled={isSubmitting}
                  className='w-full font-bold'
                >
                  {isSubmitting ? '⏳ Connexion...' : '✅ Se connecter'}
                </Button>

                <Link
                  to='/'
                  className='text-sm text-purple-600 hover:text-purple-800 transition-colors flex items-center font-semibold'
                >
                  <BackIcon className='h-4 w-4 mr-1' />
                  Retour à l'accueil
                </Link>
              </div>
            </form>
            
            <div className='mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded'>
              <p className='text-xs text-gray-700'>
                <span className='font-bold'>Accès démo:</span> Utilisez n'importe quels identifiants pour vous connecter
              </p>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Login;
