import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// Assurez-vous que ce chemin est correct pour votre fichier de données
import { facultiesData } from '../data/sampleData';
import Footer from '../components/layout/Footer';

// --- Fonctions d'Icônes ---
const FacultyIcon = () => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    className='w-6 h-6 text-blue-600'
    fill='none'
    viewBox='0 0 24 24'
    stroke='currentColor'
    strokeWidth={2}
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M12 14l9-5-9-5-9 5 9 5zm0 0l-9 5 9 5 9-5-9-5z'
    />
  </svg>
);
const DeptIcon = () => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    className='w-6 h-6 text-green-600'
    fill='none'
    viewBox='0 0 24 24'
    stroke='currentColor'
    strokeWidth={2}
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M8 14v3m4-3v3m4-3v3M3 21h18M5 10h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v3a2 2 0 002 2zm1 0h12v3H6v-3z'
    />
  </svg>
);
const ProgramIcon = () => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    className='w-6 h-6 text-purple-600'
    fill='none'
    viewBox='0 0 24 24'
    stroke='currentColor'
    strokeWidth={2}
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
    />
  </svg>
);
// ----------------------------

// Composant de l'en-tête (HeaderPastel) (inchangé)
const HeaderPastel = ({ currentPath }) => (
  <div className='bg-gray-200 py-4 px-6 md:px-12 rounded-t-lg'>
    <div className='max-w-7xl mx-auto flex justify-between items-center'>
      <div className='flex items-center space-x-4 flex-grow'>
        <div className='w-12 h-12 bg-white rounded-full border border-gray-300'></div>
        <span className='text-gray-700 font-semibold text-sm hidden sm:block'>
          Université de Yaoundé I
        </span>
      </div>

      {currentPath !== '/login' && (
        <nav className='flex text-gray-700 font-medium ml-auto'>
          <Link to='/' className='hover:text-blue-600 transition-colors mr-10'>
            Accueil
          </Link>
          <Link
            to='/student'
            className='hover:text-blue-600 transition-colors mr-10'
          >
            Emploi du temps
          </Link>
          <Link to='/login' className='hover:text-blue-600 transition-colors'>
            Connexion Admin
          </Link>
        </nav>
      )}

      {currentPath === '/login' && (
        <nav className='flex text-gray-700 font-medium ml-auto'>
          <Link to='/' className='hover:text-blue-600 transition-colors'>
            Accueil
          </Link>
        </nav>
      )}
    </div>
  </div>
);

const StudentPortal = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState('');

  const steps = ['Facultés', 'Départements', 'Programmes', 'Emploi du temps'];

  const handleBack = () => {
    setSelectedProgram('');
    if (currentStep === 3) {
      setSelectedDepartment(null);
    } else if (currentStep === 2) {
      setSelectedFaculty(null);
    }
    setCurrentStep(currentStep - 1);
  };

  const handleFacultySelect = (faculty) => {
    setSelectedFaculty(faculty);
    setCurrentStep(2);
  };

  const handleDepartmentSelect = (department) => {
    setSelectedDepartment(department);
    setCurrentStep(3);
  };

  const handleProgramSelect = (program) => {
    setSelectedProgram(program);
    setCurrentStep(4);
  };

  return (
    <div className='min-h-screen bg-gray-100 p-4 sm:p-8 flex flex-col items-center'>
      <div className='max-w-5xl w-full mx-auto bg-white shadow-xl rounded-lg overflow-hidden'>
        <HeaderPastel currentPath='/student' />

        {/* Contenu principal */}
        <div className='px-6 py-12'>
          <div className='mb-8 text-center'>
            <h2 className='text-3xl font-bold text-gray-900 mb-2'>
              {steps[currentStep - 1]}
            </h2>
            <p className='text-lg text-gray-600'>
              {currentStep === 1 && 'Sélectionnez une faculté pour continuer.'}
              {currentStep === 2 &&
                `Départements de la faculté ${
                  selectedFaculty ? selectedFaculty.name : ''
                }.`}
              {currentStep === 3 &&
                `Programmes du département ${
                  selectedDepartment ? selectedDepartment.name : ''
                }.`}
              {currentStep === 4 && `Emploi du temps pour ${selectedProgram}.`}
            </p>
          </div>

          {currentStep > 1 && (
            <button
              onClick={handleBack}
              className='bg-gray-300 text-gray-700 px-4 py-2 mb-6 rounded-full hover:bg-gray-400 transition-colors font-semibold flex items-center shadow-sm text-sm'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-5 w-5 mr-1'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M10 19l-7-7m0 0l7-7m-7 7h18'
                />
              </svg>
              Retour
            </button>
          )}

          {/* Grille des facultés - ÉTAPE 1 (inchangée) */}
          {currentStep === 1 && (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {facultiesData.faculties.map((faculty) => (
                <button
                  key={faculty.id}
                  onClick={() => handleFacultySelect(faculty)}
                  className='bg-white p-6 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-left shadow-md'
                >
                  <div className='flex items-center'>
                    <div className='w-12 h-12 p-3 bg-blue-100 rounded-full mr-4 flex-shrink-0 flex items-center justify-center'>
                      <FacultyIcon />
                    </div>
                    <div className='flex-grow'>
                      <div className='font-bold text-lg text-gray-900 mb-1'>
                        {faculty.name}
                      </div>
                      <div className='text-sm text-gray-500'>
                        {faculty.departments.length} départements
                      </div>
                    </div>
                    <span className='text-gray-500 font-bold ml-4'>→</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Grille des départements - ÉTAPE 2 (inchangée) */}
          {currentStep === 2 && selectedFaculty && (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {selectedFaculty.departments.map((dept) => (
                <button
                  key={dept.id}
                  onClick={() => handleDepartmentSelect(dept)}
                  className='bg-white p-6 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-left shadow-md'
                >
                  <div className='flex items-center'>
                    <div className='w-12 h-12 p-3 bg-green-100 rounded-full mr-4 flex-shrink-0 flex items-center justify-center'>
                      <DeptIcon />
                    </div>
                    <div className='flex-grow'>
                      <div className='font-bold text-lg text-gray-900 mb-1'>
                        {dept.name}
                      </div>
                      <div className='text-sm text-gray-500'>
                        {dept.programs.length} programmes
                      </div>
                    </div>
                    <span className='text-gray-500 font-bold ml-4'>→</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Grille des programmes - ÉTAPE 3 (inchangée) */}
          {currentStep === 3 && selectedDepartment && (
            <div className='grid grid-cols-1 gap-4'>
              {selectedDepartment.programs.map((program, idx) => (
                <button
                  key={idx}
                  onClick={() => handleProgramSelect(program)}
                  className='bg-white p-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-left flex justify-between items-center shadow-sm'
                >
                  <div className='flex items-center'>
                    <div className='w-10 h-10 p-2 bg-purple-100 rounded-full mr-4 flex items-center justify-center'>
                      <ProgramIcon />
                    </div>
                    <div className='font-semibold text-gray-900'>{program}</div>
                  </div>
                  <span className='text-gray-500 font-bold'>→</span>
                </button>
              ))}
            </div>
          )}

          {/* Emploi du temps (Étape 4 : Grille) - MISE À JOUR ICI */}
          {currentStep === 4 && (
            <div>
              {/* Filtres Département, Niveau, Semaine - Maintenant dans des BOXES claires */}
              <div className='flex flex-wrap gap-4 mb-8 justify-start'>
                {/* Box de sélection Département */}
                <div className='p-2 border border-gray-400 rounded-lg shadow-sm bg-gray-50 text-gray-700 font-semibold cursor-pointer flex items-center hover:bg-gray-100 transition-colors'>
                  Départements <span className='ml-2 text-sm'>↓</span>
                </div>

                {/* Box de sélection Niveau */}
                <div className='p-2 border border-gray-400 rounded-lg shadow-sm bg-gray-50 text-gray-700 font-semibold cursor-pointer flex items-center hover:bg-gray-100 transition-colors'>
                  Niveau <span className='ml-2 text-sm'>↓</span>
                </div>

                {/* Box de sélection Semaine */}
                <div className='p-2 border border-gray-400 rounded-lg shadow-sm bg-gray-50 text-gray-700 font-semibold cursor-pointer flex items-center hover:bg-gray-100 transition-colors'>
                  Semaine <span className='ml-2 text-sm'>↓</span>
                </div>
              </div>

              {/* Grille de l'Emploi du Temps - CADRE RETIRÉ */}
              <div className='overflow-x-auto bg-white'>
                <table className='min-w-full divide-y divide-gray-200 border border-gray-300'>
                  {' '}
                  {/* Conserver une bordure externe légère */}
                  {/* En-têtes des jours */}
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-300 w-1/12'>
                        Heure
                      </th>
                      {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'].map(
                        (day) => (
                          <th
                            key={day}
                            className='px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase tracking-wider border-r border-gray-300 w-1/5'
                          >
                            {day}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  {/* Corps du tableau */}
                  <tbody className='divide-y divide-gray-200'>
                    {[
                      '08:00 - 10:00',
                      '10:00 - 12:00',
                      '13:00 - 15:00',
                      '15:00 - 17:00',
                    ].map((time, timeIdx) => (
                      <tr
                        key={timeIdx}
                        className='hover:bg-blue-50 transition-colors'
                      >
                        <td className='px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-700 bg-gray-50 border-r border-gray-300'>
                          {time}
                        </td>

                        {/* Cellules vides pour les cours */}
                        {Array(5)
                          .fill(null)
                          .map((_, dayIdx) => (
                            <td
                              key={dayIdx}
                              className='px-4 py-8 whitespace-nowrap border-r border-gray-300'
                            >
                              {/* Contenu du cours (à remplir dynamiquement) */}
                            </td>
                          ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer harmonisé */}
        <Footer />
      </div>
    </div>
  );
};

export default StudentPortal;
