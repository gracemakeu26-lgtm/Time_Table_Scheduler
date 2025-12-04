import React from 'react';

const Select = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Sélectionnez une option',
  disabled = false,
  error = '',
  className = '',
  name,
  required = false,
}) => {
  return (
    <div className={`${className} ${className.includes('w-') ? '' : 'w-full'}`}>
      {label && (
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          {label}
          {required && <span className='text-red-500 ml-1'>*</span>}
        </label>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
        } ${error ? 'border-red-500' : 'border-gray-300'}`}
      >
        <option value=''>{placeholder}</option>
        {options.map((option) => (
          <option
            key={option.id || option.value}
            value={option.id || option.value}
          >
            {option.name || option.label}
          </option>
        ))}
      </select>
      {error && <p className='mt-1 text-sm text-red-500'>{error}</p>}
    </div>
  );
};

export default Select;
