import React from 'react';
import { Card } from '../common';
import {
  FacultyIcon,
  DepartmentIcon,
  ProgramIcon,
  ArrowRightIcon,
} from '../icons';

export const FacultyCard = ({ faculty, onSelect }) => (
  <Card hoverable onClick={() => onSelect(faculty)} className='cursor-pointer card-hover bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200'>
    <div className='flex items-center'>
      <div className='w-12 h-12 p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mr-4 shrink-0 flex items-center justify-center text-white'>
        <FacultyIcon />
      </div>
      <div className='grow'>
        <div className='font-bold text-lg text-blue-900 mb-1'>
          {faculty.name}
        </div>
        <div className='text-sm text-blue-600 font-semibold'>
          📚 {faculty.departments?.length || 0} départements
        </div>
      </div>
      <ArrowRightIcon className='text-blue-500 font-bold ml-4 text-xl' />
    </div>
  </Card>
);

export const DepartmentCard = ({ department, onSelect }) => (
  <Card
    hoverable
    onClick={() => onSelect(department)}
    className='cursor-pointer card-hover bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200'
  >
    <div className='flex items-center'>
      <div className='w-12 h-12 p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-full mr-4 shrink-0 flex items-center justify-center text-white'>
        <DepartmentIcon />
      </div>
      <div className='grow'>
        <div className='font-bold text-lg text-green-900 mb-1'>
          {department.name}
        </div>
        <div className='text-sm text-green-600 font-semibold'>
          📋 {department.programs?.length || 0} programmes
        </div>
      </div>
      <ArrowRightIcon className='text-green-500 font-bold ml-4 text-xl' />
    </div>
  </Card>
);

export const ProgramCard = ({ program, onSelect }) => (
  <Card hoverable onClick={() => onSelect(program)} className='cursor-pointer card-hover bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200'>
    <div className='flex items-center justify-between'>
      <div className='flex items-center'>
        <div className='w-10 h-10 p-2 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full mr-4 flex items-center justify-center text-white'>
          <ProgramIcon />
        </div>
        <div className='font-semibold text-gray-900'>{program}</div>
      </div>
      <ArrowRightIcon className='text-purple-500 font-bold text-xl' />
    </div>
  </Card>
);
