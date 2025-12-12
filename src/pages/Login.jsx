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
    <div
      className='min-h-screen flex flex-col items-center pt-22'
      style={{
        backgroundImage: "url('background.jpg')",
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
    {/* <div className="min-h-screen flex flex-col items-center pt-22"> */}
      {/* full-bleed header */}
      <Header />

      {/* centered page card */}
      <div className='w-full max-w-5xl mx-auto overflow-hidden flex-1 md:h-[80vh] flex flex-col'>
        <main className='w-full py-6 px-6 md:px-12 lg:px-16 flex gap-6 md:gap-10 mx-4 md:mx-10 my-6 md:my-10 justify-center flex-1 overflow-auto items-center text-center'>
          <div className='border border-transparent hover:border-gray-500 bg-white/10 backdrop-blur-3xl shadow-2xl rounded-lg max-w-md w-full p-6 md:p-10 flex flex-col justify-center items-center gap-6 md:gap-8'>
            <div className='text-center mt-6 pt-2.5'>
              <h2 className='text-2xl md:text-3xl font-extrabold text-gray-700'>
                Accès administration
              </h2>
              <p className='text-sm text-gray-700 mt-2'>
                Connectez-vous pour gérer les emplois du temps
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className='items-center flex flex-col gap-4 w-full'
            >
              <div className='w-full'>
                <Input
                  label=''
                  placeholder='Identifiant'
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

              <div className='w-full'>
                <Input
                  label=''
                  placeholder='Mot de passe'
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

              {loginError && (
                <div className='w-full p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm'>
                  {loginError}
                </div>
              )}

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
                  className='text-sm text-gray-300 hover:text-blue-600 transition-colors flex items-center'
                >
                  <BackIcon className='h-4 w-4 mr-1' />
                  Retour à l'accueil
                </Link>
              </div>
            </form>
          </div>
        </main>
      </div>

      {/* </div>  */}
      {/* full-bleed footer */}
      <Footer />
    </div>
  );
};

export default Login;
