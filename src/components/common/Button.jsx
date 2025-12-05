import React from 'react';
import { Link } from 'react-router-dom';

const Button = ({
  children,
  onClick,
  to,
  variant = 'primary',
  className = '',
  disabled = false,
  type = 'button',
  ...props
}) => {
  const baseStyles =
    'inline-flex text-gray-700 items-center justify-center font-semibold transition-colors rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 px-4 py-3';

  const variants = {
    primary: 'bg-gray-300 hover:bg-gray-400 focus:ring-gray-400',
    secondary: 'bg-white hover:bg-gray-100 focus:ring-gray-400',
    success: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
    ghost: 'bg-transparent hover:bg-gray-100 focus:ring-gray-300',
  };

  const classes = `${baseStyles} ${variants[variant]} ${
    disabled ? 'opacity-50 cursor-not-allowed' : ''
  } ${className}`;

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={classes}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
