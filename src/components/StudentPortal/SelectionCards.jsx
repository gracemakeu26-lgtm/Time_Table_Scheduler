import React from 'react';
import { Card } from '../common';
import {
  FacultyIcon,
  DepartmentIcon,
  ProgramIcon,
  ArrowRightIcon,
} from '../icons';

export const FacultyCard = ({ faculty, onSelect }) => (
  <Card
    hoverable
    onClick={() => onSelect(faculty)}
    className='cursor-pointer card-hover bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md flex items-center justify-between  '
  >
    <div className=' p-2 bg-blue-50 rounded-lg mr-4 shrink-0 flex items-center justify-center text-blue-600'>
      <FacultyIcon />
    </div>
    <div className='grow'>
      <div className='font-semibold text-base text-gray-900 mb-1'>
        {faculty.name}
      </div>
      <div className='text-sm text-gray-500'>
        {faculty.departments?.length || 0} départements
      </div>
    </div>
    <ArrowRightIcon className='text-gray-400 h-4 w-6' />
  </Card>
);

export const DepartmentCard = ({ department, onSelect }) => (
  <Card
    hoverable
    onClick={() => onSelect(department)}
    className='cursor-pointer card-hover bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md'
  >
    <div className='flex items-center'>
      <div className='w-12 h-12 p-3 bg-blue-50 rounded-lg mr-4 shrink-0 flex items-center justify-center text-blue-600'>
        <DepartmentIcon />
      </div>
      <div className='grow'>
        <div className='font-semibold text-base text-gray-900 mb-1'>
          {department.name}
        </div>
        <div className='text-sm text-gray-500'>
          {department.programs?.length || 0} programmes
        </div>
      </div>
      <ArrowRightIcon />
    </div>
  </Card>
);

export const ProgramCard = ({ program, onSelect }) => (
  <Card
    hoverable
    onClick={() => onSelect(program)}
    className='cursor-pointer card-hover bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md'
  >
    <div className='flex items-center justify-between'>
      <div className='flex items-center'>
        <div className='w-10 h-10 p-2 bg-blue-50 rounded-lg mr-4 flex items-center justify-center text-blue-600'>
          <ProgramIcon />
        </div>
        <div className='font-medium text-gray-900'>{program}</div>
      </div>
      <ArrowRightIcon />
    </div>
  </Card>
);
