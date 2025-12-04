import React from 'react';

const Card = ({
  children,
  onClick,
  className = '',
  hoverable = false,
  padding = 'md',
  ...props
}) => {
  const baseStyles =
    'bg-white rounded-lg border border-gray-300 shadow-md transition-colors';

  const paddings = {
    sm: 'p-2',
    md: 'p-2',
    lg: 'p-8',
    none: '',
  };

  const hoverStyles = hoverable ? 'hover:bg-gray-50 cursor-pointer' : '';

  const classes = `${baseStyles} ${paddings[padding]} ${hoverStyles} ${className}`;

  return (
    <div onClick={onClick} className={classes} {...props}>
      {children}
    </div>
  );
};

export default Card;
