import React from 'react';
import { Button } from '../components/common';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import {
  FacultyCard,
  DepartmentCard,
  ProgramCard,
} from '../components/StudentPortal/SelectionCards';
import TimetableView from '../components/StudentPortal/TimetableView';
import { BackIcon } from '../components/icons';
import { facultiesData } from '../data/sampleData';
import { useStepNavigation, useTimetableFilters } from '../hooks';
import { STUDENT_PORTAL_STEPS, WEEKS } from '../constants';

const StudentPortal = () => {
  const { currentStep, previousStep, nextStep } = useStepNavigation(1, 4);
  const {
    selectedFaculty,
    setSelectedFaculty,
    selectedDepartment,
    setSelectedDepartment,
    selectedProgram,
    setSelectedProgram,
    availableDepartments,
    availablePrograms,
  } = useTimetableFilters(facultiesData);

  const handleFacultySelect = (faculty) => {
    setSelectedFaculty(faculty);
    nextStep();
  };

  const handleDepartmentSelect = (department) => {
    setSelectedDepartment(department);
    nextStep();
  };

  const handleProgramSelect = (program) => {
    setSelectedProgram(program);
    nextStep();
  };

  const handleBack = () => {
    if (currentStep === 4) {
      setSelectedProgram('');
    } else if (currentStep === 3) {
      setSelectedDepartment(null);
    } else if (currentStep === 2) {
      setSelectedFaculty(null);
    }
    previousStep();
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1:
        return 'Sélectionnez une faculté pour continuer.';
      case 2:
        return `Départements de la faculté ${selectedFaculty?.name || ''}.`;
      case 3:
        return `Programmes du département ${selectedDepartment?.name || ''}.`;
      case 4:
        return `Emploi du temps pour ${selectedProgram}.`;
      default:
        return '';
    }
  };

  return (
    <div className='min-h-screen relative flex flex-col items-center justify-start p-4 sm:p-8'>
      <div className='max-w-5xl w-full mx-auto glass-effect rounded-3xl overflow-hidden shadow-2xl'>
        <Header />

        <div className='px-6 py-12 bg-gradient-to-b from-blue-50 to-white'>
          {/* Progress Indicator */}
          <div className='flex justify-center items-center gap-2 mb-8'>
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className='flex items-center'>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                  step <= currentStep
                    ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step}
                </div>
                {step < 4 && <div className={`w-8 h-1 mx-1 ${
                  step < currentStep ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gray-200'
                }`}></div>}
              </div>
            ))}
          </div>

          {/* Step Title and Description */}
          <div className='mb-8 text-center'>
            <h2 className='text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2'>
              {STUDENT_PORTAL_STEPS[currentStep - 1].name}
            </h2>
            <p className='text-lg text-gray-700 font-medium'>{getStepDescription()}</p>
          </div>

          {/* Back Button */}
          {currentStep > 1 && (
            <Button
              onClick={handleBack}
              variant='ghost'
              className='mb-6 flex items-center'
            >
              <BackIcon className='h-5 w-5 mr-1' />
              Retour
            </Button>
          )}

          {/* Step 1: Faculties */}
          {currentStep === 1 && (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {facultiesData.faculties.map((faculty) => (
                <FacultyCard
                  key={faculty.id}
                  faculty={faculty}
                  onSelect={handleFacultySelect}
                />
              ))}
            </div>
          )}

          {/* Step 2: Departments */}
          {currentStep === 2 && selectedFaculty && (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {availableDepartments.map((dept) => (
                <DepartmentCard
                  key={dept.id}
                  department={dept}
                  onSelect={handleDepartmentSelect}
                />
              ))}
            </div>
          )}

          {/* Step 3: Programs */}
          {currentStep === 3 && selectedDepartment && (
            <div className='grid grid-cols-1 gap-4'>
              {availablePrograms.map((program, idx) => (
                <ProgramCard
                  key={idx}
                  program={program}
                  onSelect={handleProgramSelect}
                />
              ))}
            </div>
          )}

          {/* Step 4: Timetable */}
          {currentStep === 4 && (
            <TimetableView
              selectedProgram={selectedProgram}
              departments={availableDepartments}
              weeks={WEEKS}
            />
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default StudentPortal;
