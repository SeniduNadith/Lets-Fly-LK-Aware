import React from 'react';

export const ActionCard = ({
  title,
  description,
  icon,
  bgColor,
  textColor,
  onClick,
  disabled = false
}) => {
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  return (
    <div
      className={`bg-white p-6 rounded-lg shadow-sm border border-gray-200 transition-all cursor-pointer ${
        disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'hover:shadow-md hover:scale-105'
      }`}
      onClick={handleClick}
    >
      <div className="flex items-center mb-4">
        <div className={`p-2 ${bgColor} rounded-lg`}>
          <div className={`w-6 h-6 ${textColor}`}>
            {icon}
          </div>
        </div>
        <h3 className="ml-3 text-lg font-medium text-gray-900">{title}</h3>
      </div>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default ActionCard;
