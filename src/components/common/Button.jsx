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
    primary: 'bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-900',
    secondary: 'bg-white hover:bg-gray-100 focus:ring-gray-400',
    success: 'bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-900',
    danger: 'bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-900',
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
