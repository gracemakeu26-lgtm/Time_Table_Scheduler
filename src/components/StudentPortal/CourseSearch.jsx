import React, { useState } from 'react';

const CourseSearch = ({ courses, onFilteredCoursesChange }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (!term.trim()) {
      onFilteredCoursesChange(courses);
      return;
    }

    const filtered = courses.filter(
      (course) =>
        course.course.toLowerCase().includes(term.toLowerCase()) ||
        course.teacher.toLowerCase().includes(term.toLowerCase()) ||
        course.room.toLowerCase().includes(term.toLowerCase()),
    );
    onFilteredCoursesChange(filtered);
  };

  return (
    <div className='mb-6 relative'>
      <input
        type='text'
        placeholder='Rechercher un cours, enseignant ou salle...'
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        className='w-full px-6 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-100 transition-all'
      />
      {searchTerm && (
        <button
          onClick={() => handleSearch('')}
          className='absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700'
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default CourseSearch;
