import React, { useState, useEffect } from 'react';
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
import { departmentsAPI, levelsAPI, timetablesAPI } from '../utils/api';
import { useStepNavigation } from '../hooks';
import { STUDENT_PORTAL_STEPS, WEEKS } from '../constants';

// Map department codes/names to faculties (since backend doesn't have faculties)
// This maps backend department names/codes to faculty names from sampleData
const getFacultyForDepartment = (deptName, deptCode) => {
  const name = (deptName || '').toLowerCase();
  const code = (deptCode || '').toUpperCase();

  // Faculty of Sciences
  if (
    name.includes('computer science') ||
    code === 'CS' ||
    name.includes('mathematics') ||
    code === 'MATH' ||
    name.includes('math') ||
    name.includes('physics') ||
    code === 'PHY' ||
    name.includes('chemistry') ||
    code === 'CHEM' ||
    name.includes('biosciences') ||
    name.includes('biology') ||
    code === 'BIO' ||
    name.includes('engineering') ||
    code === 'ENG'
  ) {
    return 'Faculty of Sciences';
  }

  // Faculty of Letters and Human Sciences
  if (
    name.includes('business') ||
    code === 'BUS' ||
    name.includes('anglais') ||
    name.includes('english') ||
    name.includes('français') ||
    name.includes('french') ||
    name.includes('psychology') ||
    name.includes('social science')
  ) {
    return 'Faculty of Letters and Human Sciences';
  }

  // Faculty of Arts
  if (
    name.includes('art') ||
    name.includes('visual') ||
    name.includes('performing') ||
    name.includes('theater') ||
    name.includes('cinema') ||
    name.includes('music')
  ) {
    return 'Faculty of Arts';
  }

  // Faculty of Education Sciences
  if (
    name.includes('education') ||
    name.includes('ict') ||
    name.includes('pedagogy')
  ) {
    return 'Faculty of Education Sciences';
  }

  // Faculty of Medicine and Biomedical Sciences
  if (
    name.includes('medicine') ||
    name.includes('biomedical') ||
    name.includes('santé') ||
    name.includes('health')
  ) {
    return 'Faculty of Medicine and Biomedical Sciences';
  }

  // Default to Faculty of Sciences if no match
  return 'Faculty of Sciences';
};

const StudentPortal = () => {
  const { currentStep, previousStep, nextStep } = useStepNavigation(1, 4);
  const [faculties, setFaculties] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]);
  const [levels, setLevels] = useState([]);
  const [deptLevels, setDeptLevels] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedTimetable, setSelectedTimetable] = useState(null);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Auto-dismiss error after 35 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 35000); // 35 seconds

      return () => clearTimeout(timer);
    }
  }, [error]);

  // Fetch departments and levels on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [departmentsData, levelsData] = await Promise.all([
          departmentsAPI.getAll(),
          levelsAPI.getAll({ active_only: true }),
        ]);
        const deptArray = Array.isArray(departmentsData) ? departmentsData : [];
        setAllDepartments(deptArray);
        setLevels(Array.isArray(levelsData) ? levelsData : []);
        // Build faculties dynamically from departments grouping
        const facultyMap = new Map();
        deptArray.forEach((dept) => {
          const facName = getFacultyForDepartment(dept.name, dept.code);
          if (!facultyMap.has(facName)) {
            facultyMap.set(facName, {
              id: facName,
              name: facName,
              departments: [],
            });
          }
          facultyMap.get(facName).departments.push(dept);
        });
        setFaculties(Array.from(facultyMap.values()));
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Departments available within selected faculty
  const availableDepartments = selectedFaculty?.departments || [];

  const handleFacultySelect = (faculty) => {
    setSelectedFaculty(faculty);
    nextStep();
  };

  const handleDepartmentSelect = (department) => {
    setSelectedDepartment(department);
    // Compute available levels (programs) from department courses (public endpoint)
    const computeLevelsForDepartment = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await departmentsAPI.getCourses(department.id);
        const deptCourses = Array.isArray(data?.courses)
          ? data.courses
          : Array.isArray(data)
          ? data
          : [];

        const levelIdsWithCourses = new Set(
          deptCourses.map((c) => c.level_id).filter((id) => !!id),
        );
        const levelsWithDeptCourses = levels.filter((lvl) =>
          levelIdsWithCourses.has(lvl.id),
        );
        setDeptLevels(levelsWithDeptCourses);
        nextStep();
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load programs');
        console.error('Error fetching department courses:', err);
      } finally {
        setLoading(false);
      }
    };
    computeLevelsForDepartment();
  };

  const handleLevelSelect = async (level) => {
    setSelectedLevel(level);
    setLoading(true);
    setError('');

    try {
      // Fetch published timetables for department with slots
      const timetablesData = await timetablesAPI.getAll({
        department_id: selectedDepartment.id,
        level_id: level.id,
        status: 'published',
        include_slots: true,
        academic_year: selectedAcademicYear || undefined,
        semester: selectedSemester || undefined,
      });

      console.log(timetablesData);

      const timetablesArray = Array.isArray(timetablesData)
        ? timetablesData
        : [];

      if (timetablesArray.length === 0) {
        throw new Error(
          'No published timetable found for the selected criteria.',
        );
      }

      // For simplicity, take the first timetable
      const fullTimetable = timetablesArray[0];

      setSelectedTimetable(fullTimetable);
      nextStep();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load timetable');
      console.error('Error fetching timetable:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep === 4) {
      setSelectedTimetable(null);
      setSelectedLevel(null);
    } else if (currentStep === 3) {
      setSelectedLevel(null);
    } else if (currentStep === 2) {
      setSelectedDepartment(null);
    } else if (currentStep === 1) {
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
        return `Programs (Levels) of the department ${
          selectedDepartment?.name || ''
        }.`;
      case 4:
        return `Timetable for ${selectedLevel?.name || ''} - ${
          selectedDepartment?.name || ''
        }.`;
      default:
        return '';
    }
  };

  return (
    <div className='min-h-screen mt-7 bg-gray-100 flex flex-col items-center pt-22'>
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

            {/* Error Message */}
            {error && (
              <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
                {error}
              </div>
            )}

            {/* Back Button */}
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className='text-gray-900 hover:text-gray-800 font-medium flex items-center gap-2 mb-4'
              >
                <BackIcon className='h-5 w-5' />
                Back
              </button>
            )}

            {/* Step 1: Faculties */}
            {currentStep === 1 && (
              <div className='grid grid-cols-2 md:grid-cols-3 gap-7'>
                {faculties.map((faculty) => (
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
              <div>
                {loading ? (
                  <div className='text-center py-12'>
                    <p className='text-gray-600'>Loading departments...</p>
                  </div>
                ) : availableDepartments.length === 0 ? (
                  <div className='text-center py-12'>
                    <p className='text-gray-600'>
                      No departments found for this faculty. Please ensure
                      departments are properly configured.
                    </p>
                  </div>
                ) : (
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
              </div>
            )}

            {/* Step 3: Programs (Levels) */}
            {currentStep === 3 && selectedDepartment && (
              <div>
                {/* Filters for Academic Year and Semester */}
                <div className='flex flex-wrap gap-4 mb-4 items-center'>
                  <div>
                    <label className='block text-sm text-gray-600 mb-1'>
                      Academic Year
                    </label>
                    <input
                      type='text'
                      placeholder='e.g. 2024-2025'
                      value={selectedAcademicYear}
                      onChange={(e) => setSelectedAcademicYear(e.target.value)}
                      className='px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-500'
                    />
                  </div>
                  <div>
                    <label className='block text-sm text-gray-600 mb-1'>
                      Semester
                    </label>
                    <select
                      value={selectedSemester}
                      onChange={(e) => setSelectedSemester(e.target.value)}
                      className='px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-500'
                    >
                      <option value=''>Any</option>
                      <option value='Fall'>Fall</option>
                      <option value='Spring'>Spring</option>
                      <option value='Summer'>Summer</option>
                    </select>
                  </div>
                </div>
                {loading ? (
                  <div className='text-center py-12'>
                    <p className='text-gray-600'>Loading programs...</p>
                  </div>
                ) : deptLevels.length === 0 ? (
                  <div className='text-center py-12'>
                    <p className='text-gray-600'>No programs available.</p>
                  </div>
                ) : (
                  <div className='grid grid-cols-2 md:grid-cols-3 gap-6'>
                    {deptLevels.map((level) => (
                      <ProgramCard
                        key={level.id}
                        program={level.name}
                        onSelect={() => handleLevelSelect(level)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Timetable */}
            {currentStep === 4 && selectedTimetable && (
              <div>
                {loading ? (
                  <div className='text-center py-12'>
                    <p className='text-gray-600'>Loading timetable...</p>
                  </div>
                ) : (
                  <TimetableView
                    timetable={selectedTimetable}
                    selectedDepartment={selectedDepartment}
                    selectedLevel={selectedLevel}
                    selectedProgram={selectedLevel?.name}
                    weeks={WEEKS}
                  />
                )}
              </div>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default StudentPortal;
