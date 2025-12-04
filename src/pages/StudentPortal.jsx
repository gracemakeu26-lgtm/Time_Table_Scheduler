import React from 'react';
import { Button, Breadcrumb } from '../components/common';
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
        return 'Select a faculty to continue.';
      case 2:
        return `Departments of the faculty ${selectedFaculty?.name || ''}.`;
      case 3:
        return `Programs of the department ${selectedDepartment?.name || ''}.`;
      case 4:
        return `Timetable for ${selectedProgram}.`;
      default:
        return '';
    }
  };

  return (
    <div className='min-h-screen bg-gray-100 flex flex-col items-center pt-22'>
      <Header />
      <div className='min-h-[71vh] p-4 flex flex-col max-w-5xl w-full bg-white shadow-xl rounded-lg overflow-hidden'>
        <main className='flex-1 bg-white'>
          <div className='max-w-6xl'>
            {/* Progress Indicator */}
            <div className='flex justify-between items-center gap-1 mt-8 pb-10'>
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className='flex-1 flex items-center'>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                      step <= currentStep
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {step}
                  </div>
                  {step < 4 && (
                    <div
                      className={`flex-1 h-1 ${
                        step < currentStep ? 'bg-gray-900' : 'bg-gray-300'
                      }`}
                    ></div>
                  )}
                </div>
              ))}
            </div>

            {/* Step Title and Description */}
            <div className='text-center mb-8'>
              <h2 className='text-2xl font-bold text-gray-900'>
                {STUDENT_PORTAL_STEPS[currentStep - 1].name}
              </h2>
              <p className='text-gray-600'>{getStepDescription()}</p>
            </div>

            {/* Back Button */}
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className='text-gray-900 hover:text-gray-800 font-medium flex items-center gap-2'
              >
                <BackIcon className='h-5 w-5' />
                Back
              </button>
            )}

            {/* Step 1: Faculties */}
            {currentStep === 1 && (
              <div className='grid grid-cols-2 md:grid-cols-3 gap-7'>
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
              <div className='grid grid-cols-2 md:grid-cols-3 gap-6'>
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
              <div className='grid grid-cols-2 md:grid-cols-3 gap-6'>
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
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default StudentPortal;
