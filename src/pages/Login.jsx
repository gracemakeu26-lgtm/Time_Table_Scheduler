import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input, Button } from '../components/common';
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
    setTimeout(() => {
      setIsSubmitting(false);
      console.log('Login attempt:', values);
      navigate('/admin');
    }, 1000);
  };

  return (
    <div className='min-h-screen bg-linear-to-br from-white via-gray-50 to-blue-50 p-4 sm:p-8 flex flex-col items-center'>
      <div className='max-w-5xl w-full mx-auto bg-white/95 shadow-2xl rounded-lg overflow-hidden flex-1 md:h-[80vh] flex gap-7 flex-col'>
        <Header />

        <main className='py-6 px-6 md:px-12 lg:px-16 flex gap-6 md:gap-10 mx-4 md:mx-10 my-6 md:my-10 justify-center flex-1 overflow-auto items-center text-center'>
          <div className='border border-gray-200 rounded-lg shadow-md max-w-sm w-full bg-white p-6 md:p-10 flex flex-col justify-center items-center gap-6 md:gap-8'>
            <div className='text-center'>
              <h2 className='text-2xl md:text-3xl font-extrabold text-gray-800'>
                Accès administration
              </h2>
              <p className='text-sm text-gray-500 mt-2'>
                Connectez-vous pour gérer les emplois du temps
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className='flex flex-col gap-4 w-full'
            >
              <div>
                <Input
                  label='Identifiant'
                  type='text'
                  name='identifiant'
                  value={values.identifiant}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.identifiant}
                  required
                  className='mb-0'
                />
                {errors.identifiant && (
                  <p className='text-red-600 text-xs mt-1'>
                    {errors.identifiant}
                  </p>
                )}
              </div>

              <div>
                <Input
                  label='Mot de passe'
                  type='password'
                  name='motdepasse'
                  value={values.motdepasse}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.motdepasse}
                  required
                  className='mb-0'
                />
                {errors.motdepasse && (
                  <p className='text-red-600 text-xs mt-1'>
                    {errors.motdepasse}
                  </p>
                )}
              </div>

              <div className='flex flex-col items-center space-y-3 mt-2 w-full'>
                <Button
                  type='submit'
                  variant='primary'
                  disabled={isSubmitting}
                  className='w-full py-2'
                >
                  {isSubmitting ? 'Connexion...' : 'Se connecter'}
                </Button>

                <Link
                  to='/'
                  className='text-sm text-gray-500 hover:text-blue-600 transition-colors flex items-center'
                >
                  <BackIcon className='h-4 w-4 mr-1' />
                  Retour à l'accueil
                </Link>
              </div>
            </form>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Login;
